import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ILayoutContentComponent, ILayoutFooterComponent, ILayoutSidebarComponent, ILayoutTopbarComponent } from '@layout/interfaces';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { LAYOUT_MENU } from '@shared/enums';
import { ConfigService, LayoutService } from '@shared/services';
import { filter, Subscription } from 'rxjs';
import { LayoutFooterComponent } from '../layout-footer';
import { LayoutSidebarComponent } from '../layout-sidebar';
import { LayoutTopbarComponent } from '../layout-topbar';

@Component({
  selector: 'sctl-layout-content',
  standalone: true,
  templateUrl: './layout-content.component.html',
  imports: [
    CommonModule,
    LayoutTopbarComponent,
    LayoutSidebarComponent,
    RouterModule,
    LayoutFooterComponent
  ],
})
export class LayoutContentComponent implements OnInit {

  @Input() config: ILayoutContentComponent = {
    footerConfig: {},
    sidebarConfig: {},
    topbarConfig: {}
  };

  overlayMenuOpenSubscription: Subscription;

  menuOutsideClickListener: any;

  @ViewChild(LayoutSidebarComponent) appSidebar!: LayoutSidebarComponent;

  @ViewChild(LayoutTopbarComponent) appTopBar!: LayoutTopbarComponent;

  public isFooterEnabled = true;
  public isSidebarEnabled = true;

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

  constructor(
    public layoutService: LayoutService,
    public renderer: Renderer2,
    public router: Router,
    public configService: ConfigService
  ) {
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

  ngOnInit(): void {
    this.config.footerConfig = this.setFooterConfig(this.config.footerConfig);
    this.config.sidebarConfig = this.setSidebarConfig(this.config.sidebarConfig);
    this.config.topbarConfig = this.setTopbarConfig(this.config.topbarConfig);
  }

  isOutsideClicked(event: MouseEvent) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    const eventTarget = event.target as Node;

    return !(sidebarEl?.isSameNode(eventTarget) || sidebarEl?.contains(eventTarget) || topbarEl?.isSameNode(eventTarget) || topbarEl?.contains(eventTarget));
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

  get containerClass() {
    return {
      'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive && this.layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
    };
  }

  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }

  private setFooterConfig(config: ILayoutFooterComponent): ILayoutFooterComponent {
    config = config ?? {};
    config.footerTemplate = config?.footerTemplate ?? undefined;
    config.footerText = config.footerText ?? '';
    config.footerLink = config.footerLink ?? '';
    config.footerLinkText = config.footerLinkText ?? '';
    return config;
  }

  private setSidebarConfig(config: ILayoutSidebarComponent): ILayoutSidebarComponent {
    config = config ?? {};
    config.menuConfig = config?.menuConfig ?? {};
    config.menuConfig.menu = config.menuConfig?.menu ?? [];
    return config;
  }

  private setTopbarConfig(config: ILayoutTopbarComponent): ILayoutTopbarComponent {
    config = config ?? {};
    config.menuButtonCssClass = config.menuButtonCssClass ?? 'me-2 mt-2';
    config.menuButtonIconSize = config.menuButtonIconSize ?? '2rem';
    config.logoTemplate = config?.logoTemplate ?? undefined;
    config.logoRedirect = config.logoRedirect ?? undefined;
    config.logoUrl = config.logoUrl ?? undefined;
    config.logoText = config.logoText ?? 'LAYOUT';
    config.logoCssClass = config.logoCssClass ?? 'w-20';
    config.actionsTemplate = config?.actionsTemplate ?? undefined;
    config.actions = config?.actions ?? [];
    config.switchThemeDarkModeLabel = config.switchThemeDarkModeLabel ?? 'Dark mode';
    config.switchThemeLightModeLabel = config.switchThemeLightModeLabel ?? 'Light mode';
    return config;
  }
}
