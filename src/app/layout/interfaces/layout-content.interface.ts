import { ILayoutFooterComponent } from './layout-footer.interface';
import { ILayoutSidebarComponent } from './layout-sidebar.interface';
import { ILayoutTopbarComponent } from './layout-topbar.interface';

export interface ILayoutContentComponent {
  footerConfig?: ILayoutFooterComponent;
  sidebarConfig?: ILayoutSidebarComponent;
  topbarConfig?: ILayoutTopbarComponent;
}