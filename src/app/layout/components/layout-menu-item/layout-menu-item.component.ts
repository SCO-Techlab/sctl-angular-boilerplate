import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, HostBinding, inject, input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MAGIC_NUMBERS } from '@shared/constants';
import { TranslateModule } from '@shared/modules';
import { LayoutService } from '@shared/services';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[sctl-layout-menu-item]',
  templateUrl: './layout-menu-item.component.html',
  animations: [
    trigger('children', [
      state(
        'collapsed',
        style({
          height: '0'
        })
      ),
      state(
        'expanded',
        style({
          height: '*'
        })
      ),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  providers: [LayoutService]
})
export class LayoutMenuItemComponent implements OnInit, OnDestroy {

  public item = input<MenuItem>();
  public index = input<number>();
  public root = input<boolean>();
  public parentKey = input<string>();

  public active = false;
  public menuSourceSubscription: Subscription;
  public menuResetSubscription: Subscription;
  public key: string = '';

  @HostBinding('class.layout-root-menuitem')
  public get isRoot(): boolean {
    return this.root();
  }

  public get submenuAnimation() {
    return this.isRoot
      ? 'expanded'
      : this.active
        ? 'expanded'
        : 'collapsed';
  }

  @HostBinding('class.active-menuitem')
  get activeClass() {
    return this.active && !this.isRoot;
  }

  private router = inject(Router);
  private layoutService = inject(LayoutService);

  constructor() {
    this.menuSourceSubscription = this.layoutService.menuSource$.subscribe((value) => {
      Promise.resolve(null).then(() => {
        if (value.routeEvent) {
          this.active = value.key === this.key || value.key.startsWith(`${this.key}-`)
            ? true
            : false;
        } else {
          if (value.key !== this.key && !value.key.startsWith(`${this.key}-`)) {
            this.active = false;
          }
        }
      });
    });

    this.menuResetSubscription = this.layoutService.resetSource$.subscribe(() => this.active = false);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.item().routerLink) {
        this.updateActiveStateFromRoute();
      }
    });
  }

  ngOnInit(): void {
    this.key = this.parentKey()
      ? `${this.parentKey()}-${this.index()}`
      : String(this.index());

    if (this.item().routerLink) {
      this.updateActiveStateFromRoute();
    }
  }

  ngOnDestroy(): void {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }

  public itemClick(event: Event): void {
    if (this.item().disabled) {
      event.preventDefault();
      return;
    }

    if (this.item().command) {
      this.item().command({ originalEvent: event, item: this.item });
    }

    if (this.item().items) {
      this.active = !this.active;
    }

    this.layoutService.onMenuStateChange({ key: this.key });
  }

  private updateActiveStateFromRoute(): void {
    const activeRoute = this.router.isActive(
      this.item().routerLink[MAGIC_NUMBERS.N_0],
      {
        paths: 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored'
      }
    );

    if (activeRoute) {
      this.layoutService.onMenuStateChange({ key: this.key, routeEvent: true });
    }
  }
}
