import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { LayoutTopbarComponent, LayoutSidebarComponent, LayoutFooterComponent } from '@layout/components';
import { Store } from '@ngxs/store';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { LAYOUT_MENU } from '@shared/enums';
import { ConfigService, LayoutService } from '@shared/services';
import { MenuItem } from 'primeng/api';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'sctl-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  imports: [
    CommonModule,
    LayoutTopbarComponent,
    LayoutSidebarComponent,
    RouterModule,
    LayoutFooterComponent,
  ]
})
export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(LayoutSidebarComponent) appSidebar!: LayoutSidebarComponent;
  @ViewChild(LayoutTopbarComponent) appTopBar!: LayoutTopbarComponent;

  public menu: MenuItem[] = [];
  public overlayMenuOpenSubscription: Subscription;
  public menuOutsideClickListener: any;
  public isFooterEnabled: boolean = true;
  public isSidebarEnabled: boolean = true;

  public get staticMenuOpen(): boolean {
    if (!this.isSidebarEnabled) {
      return false;
    }

    if (this.layoutService.layoutConfig().menuMode !== LAYOUT_MENU.Static) {
      return false;
    }

    if (this.layoutService.layoutState().staticMenuDesktopInactive) {
      return false;
    }

    return true;
  }

  public get containerClass() {
    return {
      'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive && this.layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
    };
  }

  public layoutService = inject(LayoutService);
  public renderer = inject(Renderer2);
  public router = inject(Router);
  public configService = inject(ConfigService);
  private cdRef = inject(ChangeDetectorRef);

   constructor() {
    this.isFooterEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.FOOTER_ENABLED);
    this.isSidebarEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_ENABLED);

    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
          if (this.isOutsideClicked(event)) {
            this.hideMenu();
          }
        });
      }

      if (this.layoutService.layoutState().staticMenuMobileActive) {
        this.blockBodyScroll();
      }
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.hideMenu();
    });
  }

  ngOnInit() {
    this.menu = this.mockMenu();
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }

  isOutsideClicked(event: MouseEvent) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    const eventTarget = event.target as Node;

    return !(
      sidebarEl?.isSameNode(eventTarget) || 
      sidebarEl?.contains(eventTarget) || 
      topbarEl?.isSameNode(eventTarget) || 
      topbarEl?.contains(eventTarget)
    );
  }

  hideMenu() {
    this.layoutService.layoutState.update((prev) => ({ ...prev, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  private mockMenu() {
    return [];
  }
}