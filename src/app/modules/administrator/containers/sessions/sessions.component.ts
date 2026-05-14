import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SESSIONS_TABS } from '@modules/administrator/enums';
import { ISession } from '@modules/administrator/interfaces';
import { SessionsService } from '@modules/administrator/services';
import { CrudComponent } from '@shared/components';
import { CRUD_ACTIONS, CRUD_DELETE_TABLE_ACTION, DATES, MAGIC_NUMBERS, PERMISSIONS } from '@shared/constants';
import { BUTTON_SEVERITY, CRUD_COLUMN_TYPE, CRUD_STATE, PERMISSION_TYPE } from '@shared/enums';
import { ICrudComponent, ICrudPaginationEvent, ICrudTableAction, IPaginationQuery, IPaginationResponse, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfirmDialogService, SpinnerService, ToastService, TranslateService, UserService } from '@shared/services';
import { TabsModule } from 'primeng/tabs';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-sessions',
  standalone: true,
  templateUrl: './sessions.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CrudComponent,
    TabsModule,
  ]
})
export class SessionsComponent {
  public readonly SESSIONS_TABS = SESSIONS_TABS;
  public currentTab: SESSIONS_TABS;
  public isRefresh: boolean;

  public showTable = false;
  public crudValues: ISession[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;

  private literals: ITranslateLiterals;
  private paginationQuery: IPaginationQuery = { page: MAGIC_NUMBERS.N_1, limit: MAGIC_NUMBERS.N_5 };

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private sessionsService = inject(SessionsService);
  private userService = inject(UserService);
  private confirmDialogService = inject(ConfirmDialogService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.isRefresh = false;
    this.currentTab = SESSIONS_TABS.SESSIONS;
    this.translateService.stream('SESSIONS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCrudConfig();
        this.getValues();
      });
  }

  public onTabChange($event: string | number): void {
    if ($event === this.currentTab) {
      return;
    }

    this.currentTab = $event as SESSIONS_TABS;
    this.isRefresh = this.currentTab === SESSIONS_TABS.REFRESH_SESSIONS;
    this.setCrudConfig();
    this.getValues();
  }

  public onSelectAction(action: ICrudTableAction): void {
    if (!action?.name) {
      return;
    }

    const actionMethods = {
      ['revoke']: this.revoke.bind(this),
      [CRUD_ACTIONS.DELETE]: this.delete.bind(this)
    };

    actionMethods?.[action.name]?.(action.value);
  }

  public onDeleteMultiple(values: string[]): void {
    if (!values?.length) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE_MULTIPLE']?.['HEADER'],
      message: this.literals?.['DELETE_MULTIPLE']?.['MESSAGE'],
      rejectButton: { label: this.literals?.['DELETE_MULTIPLE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE_MULTIPLE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.sessionsService.deleteMultiple(values, this.isRefresh)
          .pipe(
            takeUntilDestroyed(this.destroyRef$),
            finalize(() => this.spinnerService.hide())
          )
          .subscribe({
            next: (res: number) => {
              if (!res) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: this.literals?.['DELETE_MULTIPLE']?.['ERROR']
                });
                return;
              }

              if (res !== values.length) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: `${this.literals?.['DELETE_MULTIPLE']?.['ERROR']} (${res}/${values.length})`
                });
              } else {
                this.toastService.success({
                  summary: this.translateService.instant('TOAST.SUCCESS'),
                  detail: this.literals?.['DELETE_MULTIPLE']?.['SUCCESS']
                });
              }
              this.getValues();
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: this.literals?.['DELETE_MULTIPLE']?.['ERROR']
              });
            }
          });
      }
    });
  }

  public onPagination(paginationEvent: ICrudPaginationEvent): void {
    this.paginationQuery.page = paginationEvent.page;
    this.paginationQuery.limit = paginationEvent.limit;
    this.getValues();
  }

  private getValues(): void {
    this.showTable = false;
    this.sessionsService.find(null, this.isRefresh, this.paginationQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.showTable = true)
      )
      .subscribe((res: IPaginationResponse<ISession>) => {
        this.crudValues = res?.data ?? [];
        this.crudConfig.pagination.totalRecords = res?.totalRecords;
        this.crudConfig.pagination.first = res?.first;
        this.crudConfig.pagination.rows = res?.limit;
      });
  }

  private delete(value: ISession): void {
    if (!value) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE']?.['HEADER'],
      message: `${this.literals?.['DELETE']?.['MESSAGE']}<br><br><center>${value?.user?.email} - ${value?.jti}</center>`,
      rejectButton: { label: this.literals?.['DELETE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.sessionsService.delete(value, this.isRefresh)
          .pipe(
            takeUntilDestroyed(this.destroyRef$),
            finalize(() => this.spinnerService.hide())
          )
          .subscribe({
            next: (res: boolean) => {
              if (!res) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: this.literals?.['DELETE']?.['ERROR']
                });
                return;
              }

              this.toastService.success({
                summary: this.translateService.instant('TOAST.SUCCESS'),
                detail: this.literals?.['DELETE']?.['SUCCESS']
              });
              this.getValues();
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: this.literals?.['DELETE']?.['ERROR']
              });
            }
          });
      }
    });
  }

  private revoke(value: ISession): void {
    if (!value) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['REVOKE']?.['HEADER'],
      message: `${this.literals?.['REVOKE']?.['MESSAGE']}<br><br><center>${value?.user?.email} - ${value?.jti}</center>`,
      rejectButton: { label: this.literals?.['REVOKE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['REVOKE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.sessionsService.revoke(value?._id, this.isRefresh)
          .pipe(
            takeUntilDestroyed(this.destroyRef$),
            finalize(() => this.spinnerService.hide())
          )
          .subscribe({
            next: (res: ISession) => {
              if (!res) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: this.literals?.['REVOKE']?.['ERROR']
                });
                return;
              }

              this.toastService.success({
                summary: this.translateService.instant('TOAST.SUCCESS'),
                detail: this.literals?.['REVOKE']?.['SUCCESS']
              });
              this.getValues();
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: this.literals?.['REVOKE']?.['ERROR']
              });
            }
          });
      }
    });
  }

  private setCrudConfig(): void {
    this.crudConfig = {
      toolbarEnabled: true,
      onlyTable: false,
      tableActions: [
        {
          name: 'revoke',
          icon: 'pi pi-ban',
          severity: BUTTON_SEVERITY.INFO,
          disabled: (value: ISession) => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.DELETE) || value?.isRevoked
        },
        { ...CRUD_DELETE_TABLE_ACTION }
      ],
      newValueButtonEnabled: false,
      multipleDeleteButtonEnabled: true,
      exportButtonEnabled: true,
      searchInputEnabled: false,
      cols: [
        {
          header: this.literals?.['COLS']['USER'],
          field: 'user',
          type: CRUD_COLUMN_TYPE.CALLBACK,
          options: { callback: { fn: (value: ISession) => value?.user?.email ?? '' } }
        },
        {
          header: this.literals?.['COLS']['JTI'],
          field: 'jti'
        },
        {
          header: this.literals?.['COLS']['EXPIRES_AT'],
          field: 'expiresAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } }
        },
        {
          header: this.literals?.['COLS']['IS_REVOKED'],
          field: 'isRevoked',
          type: CRUD_COLUMN_TYPE.BOOLEAN
        },
        {
          header: this.literals?.['COLS']['REVOKED_AT'],
          field: 'revokedAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } }
        },
        {
          header: this.literals?.['COLS']['CREATED_AT'],
          field: 'createdAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } }
        },
        {
          header: this.literals?.['COLS']['UPDATED_AT'],
          field: 'updatedAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } }
        },
      ],
      globalFilterFields: ['user', 'jti'],
      dataKey: '_id',
      titleKeys: [],
      rowHover: true,
      paginator: true,
      showCurrentPageReport: true,
      pagination: {
        ajaxPagination: true,
        rowsPerPageOptions: [MAGIC_NUMBERS.N_5, MAGIC_NUMBERS.N_10, MAGIC_NUMBERS.N_20, MAGIC_NUMBERS.N_30],
        rows: MAGIC_NUMBERS.N_5,
        totalRecords: null,
        first: null
      },
      exportFilename: !this.isRefresh ? 'sessions' : 'refresh-sessions',
      literals: {
        TITLE: !this.isRefresh ? this.literals?.['TITLE'] : this.literals?.['REFRESH_TITLE']
      },
      disabledButtons: {
        [CRUD_ACTIONS.EXPORT]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.GLOBAL_FILTER]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.DELETE]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.DELETE),
        [CRUD_ACTIONS.DELETE_MULTIPLE]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.DELETE_BULK),
      }
    };
  }
}
