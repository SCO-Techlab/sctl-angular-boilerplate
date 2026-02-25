export interface ILayoutState {
  staticMenuDesktopInactive?: boolean;
  overlayMenuActive?: boolean;
  configSidebarVisible?: boolean;
  staticMenuMobileActive?: boolean;
  menuHoverActive?: boolean;
}

export interface IMenuChangeEvent {
  key: string;
  routeEvent?: boolean;
}