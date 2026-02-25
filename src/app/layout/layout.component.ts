import { CONFIG_CONSTANTS, ConfigService } from '@/shared/services';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LayoutContentComponent } from './components';
import { ILayoutContentComponent } from './interfaces';

@Component({
  selector: 'sctl-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  imports: [
    CommonModule,
    LayoutContentComponent
  ]
})
export class LayoutComponent implements OnInit, AfterViewInit {

  public viewInit: boolean = false;
  public config: ILayoutContentComponent;

  @ViewChild('footerTemplate') private footerTemplate!: TemplateRef<any>;
  @ViewChild('logoTemplate') private logoTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate') private actionsTemplate!: TemplateRef<any>;

  constructor(
    private configService: ConfigService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.viewInit = false;
    this.config = {
      footerConfig: {
        footerTemplate: undefined,
        footerText: 'Angular Boilerplate by',
        footerLink: 'https://sco-techlab.com',
        footerLinkText: this.configService.get(CONFIG_CONSTANTS.LAYOUT.APP_NAME)
      },
      sidebarConfig: {
        menuConfig: {
          menu: this.mockMenu()
        }
      },
      topbarConfig: {
        menuButtonCssClass: 'me-2 mt-2',
        menuButtonIconSize: '1.75rem',
        logoTemplate: undefined,
        logoRedirect: '/',
        logoUrl: 'assets/images/logo-sco-techlab.png',
        logoText: this.configService.get(CONFIG_CONSTANTS.LAYOUT.APP_NAME),
        logoCssClass: 'w-20',
        actionsTemplate: undefined,
        actions: [
          {
            label: 'Profile',
            icon: 'pi pi-user',
            command: (action) => {
              console.log(action);
            }
          }
        ],
        switchThemeDarkModeLabel: 'Dark mode',
        switchThemeLightModeLabel: 'Light mode'
      }
    };
  }

  ngAfterViewInit(): void {
    if (this.footerTemplate) {
      this.config.footerConfig.footerTemplate = this.footerTemplate;
    }

    if (this.logoTemplate) {
      this.config.topbarConfig.logoTemplate = this.logoTemplate;
    }

    if (this.actionsTemplate) {
      this.config.topbarConfig.actionsTemplate = this.actionsTemplate;
    }

    this.viewInit = true;
    this.changeDetectorRef.detectChanges();
  }

  private mockMenu() {
    return [];
    return [
      {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
      },
      {
        label: 'Showcases',
        items: [
          { label: 'Toast', icon: 'pi pi-fw pi-comment', routerLink: ['/showcases/sctl-toast'] },
          { label: 'Crud', icon: 'pi pi-fw pi-pencil', routerLink: ['/showcases/sctl-crud'] },
          { label: 'Loader', icon: 'pi pi-fw pi-spinner', routerLink: ['/showcases/sctl-loader'] },
          { label: 'Spinner', icon: 'pi pi-fw pi-spinner', routerLink: ['/showcases/sctl-spinner'] },
          { label: 'Input error', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/showcases/sctl-input-error'] }
        ]
      },
      {
        label: 'UI Components',
        items: [
          { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
          { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
          { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
          { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
          { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
          { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
          { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
          { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
          { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
          { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
          { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
          { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
          { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
          { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
          { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] },
          { label: 'Crud', icon: 'pi pi-fw pi-pencil', routerLink: ['/uikit/crud'] }
        ]
      },
      {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        routerLink: ['/pages'],
        items: [
          {
            label: 'Landing',
            icon: 'pi pi-fw pi-globe',
            routerLink: ['/landing']
          },
          {
            label: 'Login',
            icon: 'pi pi-fw pi-sign-in',
            routerLink: ['/auth/login']
          },
          {
            label: 'Error',
            icon: 'pi pi-fw pi-times-circle',
            routerLink: ['/error']
          },
          {
            label: 'Access Denied',
            icon: 'pi pi-fw pi-lock',
            routerLink: ['/access']
          },
          {
            label: 'Not Found',
            icon: 'pi pi-fw pi-exclamation-circle',
            routerLink: ['/pages/notfound']
          },
          {
            label: 'Empty',
            icon: 'pi pi-fw pi-circle-off',
            routerLink: ['/pages/empty']
          }
        ]
      },
      {
        label: 'Hierarchy',
        items: [
          {
            label: 'Submenu 1',
            icon: 'pi pi-fw pi-bookmark',
            items: [
              {
                label: 'Submenu 1.1',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                  { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                  { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                  { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                ]
              },
              {
                label: 'Submenu 1.2',
                icon: 'pi pi-fw pi-bookmark',
                items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
              }
            ]
          },
          {
            label: 'Submenu 2',
            icon: 'pi pi-fw pi-bookmark',
            items: [
              {
                label: 'Submenu 2.1',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                  { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                  { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                ]
              },
              {
                label: 'Submenu 2.2',
                icon: 'pi pi-fw pi-bookmark',
                items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
              }
            ]
          }
        ]
      },
      {
        label: 'Get Started',
        items: [
          {
            label: 'Documentation',
            icon: 'pi pi-fw pi-book',
            routerLink: ['/documentation']
          },
          {
            label: 'View Source',
            icon: 'pi pi-fw pi-github',
            url: 'https://github.com/SCO-Techlab/sctl-angular-boilerplate',
            target: '_blank'
          }
        ]
      }
    ];
  }
}