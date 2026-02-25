import { ILayoutFooter } from './layout-footer.interface';
import { ILayoutSidebar } from './layout-sidebar.interface';
import { ILayoutTopbar } from './layout-topbar.interface';

export interface ILayoutConfig {
  preset?: string;
  primary?: string;
  surface?: string | undefined | null;
  darkTheme?: boolean;
  menuMode?: string;
}

export interface ILayoutContainerComponent {
  footerConfig?: ILayoutFooter;
  sidebarConfig?: ILayoutSidebar;
  topbarConfig?: ILayoutTopbar;
}