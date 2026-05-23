import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { BUTTON_SEVERITY } from '@core/shared/enums';
import { SessionsFiltersFormComponent } from '@modules/administrator/components';
import { ISession } from '@modules/administrator/interfaces';
import { SessionsService } from '@modules/administrator/services';
import { CrudComponent } from '@shared/components';
import { CRUD_ACTIONS, CRUD_DELETE_TABLE_ACTION, DATES, PERMISSIONS } from '@shared/constants';
import { CRUD_COLUMN_TYPE, CRUD_STATE, PERMISSION_TYPE } from '@shared/enums';
import { cleanObject } from '@shared/helpers';
import { ICrudComponent, ICrudPaginationEvent, ICrudTableAction, IPaginationQuery, IPaginationResponse, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfirmDialogService, DatesService, SpinnerService, ToastService, TranslateService, UserService, XlsxService } from '@shared/services';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-sessions',
  standalone: true,
  templateUrl: './sessions.component.html',
  imports: [
    TranslateModule,
    CrudComponent,
    SessionsFiltersFormComponent
  ]
})
export class SessionsComponent {
  @ViewChild('filtersForm', { static: false }) filtersForm!: SessionsFiltersFormComponent;

  public showTable = false;
  public crudValues: ISession[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;
  public filtersValue: Partial<ISession> = {};

  private literals: ITranslateLiterals;
  private paginationQuery: IPaginationQuery = { page: MAGIC_NUMBERS.N_1, limit: MAGIC_NUMBERS.N_5 };

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private sessionsService = inject(SessionsService);
  private userService = inject(UserService);
  private confirmDialogService = inject(ConfirmDialogService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);
  private xlsxService = inject(XlsxService);
  private datesService = inject(DatesService);

  ngOnInit() {
    this.translateService.stream('SESSIONS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCrudConfig();
        this.getValues();
      });
  }

  public async onExportData(): Promise<void> {
    const values = await new Promise<ISession[]>((resolve) => {
      this.sessionsService.find(null)
        .pipe(takeUntilDestroyed(this.destroyRef$))
        .subscribe({
          next: (res: ISession[]) => resolve(res ?? []),
          error: () => resolve([])
        })
    });

    if (!values?.length) {
      this.toastService.info({
        summary: this.translateService.instant('TOAST.INFO'),
        detail: this.translateService.instant('COMMON.NO_EXPORT_DATA')
      });
      return;
    }

    const yes = this.translateService.instant('COMMON.YES');
    const no = this.translateService.instant('COMMON.NO');
    const formatData = values.map((item: ISession) => {
      return {
        ['_id']: item._id,
        [this.literals?.['COLS']['USER']]: item?.user?.email,
        [this.literals?.['COLS']['ACCESS_JTI']]: item.accessJti,
        [this.literals?.['COLS']['ACCESS_EXPIRES_AT']]: item.accessExpiresAt ? this.datesService.formatDate(DATES.ISO_DATETIME, item.accessExpiresAt) : '',
        [this.literals?.['COLS']['REFRESH_JTI']]: item.refreshJti,
        [this.literals?.['COLS']['REFRESH_EXPIRES_AT']]: item.refreshExpiresAt ? this.datesService.formatDate(DATES.ISO_DATETIME, item.refreshExpiresAt) : '',
        [this.literals?.['COLS']['IS_REVOKED']]: item.isRevoked ? yes : no,
        [this.literals?.['COLS']['IS_ACCESS_REVOKED']]: item.isAccessRevoked ? yes : no,
        [this.literals?.['COLS']['IS_REFRESH_REVOKED']]: item.isRefreshRevoked ? yes : no,
        [this.literals?.['COLS']['REVOKED_AT']]: item.revokedAt ? this.datesService.formatDate(DATES.ISO_DATETIME, item.revokedAt) : '',
        [this.literals?.['COLS']['CREATED_AT']]: item.createdAt ? this.datesService.formatDate(DATES.ISO_DATETIME, item.createdAt) : '',
        [this.literals?.['COLS']['UPDATED_AT']]: item.updatedAt ? this.datesService.formatDate(DATES.ISO_DATETIME, item.updatedAt) : ''
      }
    });

    this.xlsxService.exportAsExcel(
      formatData,
      this.literals?.['FILENAME'],
      this.xlsxService.createStandardColsInfo(formatData)
    );
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
        this.sessionsService.deleteMultiple(values)
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

  public onClearFilters(): void {
    this.filtersValue = {};
    this.filtersForm?.clearForm();
    this.getValues();
  }

  public onSearchFilters(): void {
    this.getValues();
  }

  private getValues(): void {
    this.showTable = false;
    const filter: any = Object.values(cleanObject(this.filtersValue))?.length
      ? this.filtersValue
      : null;
    this.sessionsService.find(filter, this.paginationQuery)
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
      message: `${this.literals?.['DELETE']?.['MESSAGE']}<br><br><center>${value?.user?.email} - ${value?._id}</center>`,
      rejectButton: { label: this.literals?.['DELETE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.sessionsService.delete(value)
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
      message: `${this.literals?.['REVOKE']?.['MESSAGE']}<br><br><center>${value?.user?.email} - ${value?._id}</center>`,
      rejectButton: { label: this.literals?.['REVOKE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['REVOKE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.sessionsService.revoke(value?._id)
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
      filtersEnabled: true,
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
          header: this.literals?.['COLS']['ACCESS_JTI'],
          field: 'accessJti',
          headerStyles: 'min-width: 300px',
          fieldStyles: 'min-width: 300px',
        },
        {
          header: this.literals?.['COLS']['ACCESS_EXPIRES_AT'],
          field: 'accessExpiresAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } },
          headerStyles: 'min-width: 165px',
          fieldStyles: 'min-width: 165px',
        },
        {
          header: this.literals?.['COLS']['REFRESH_JTI'],
          field: 'refreshJti',
          headerStyles: 'min-width: 300px',
          fieldStyles: 'min-width: 300px',
        },
        {
          header: this.literals?.['COLS']['REFRESH_EXPIRES_AT'],
          field: 'refreshExpiresAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } },
          headerStyles: 'min-width: 165px',
          fieldStyles: 'min-width: 165px',
        },
        {
          header: this.literals?.['COLS']['IS_REVOKED'],
          field: 'isRevoked',
          type: CRUD_COLUMN_TYPE.BOOLEAN
        },
        {
          header: this.literals?.['COLS']['IS_ACCESS_REVOKED'],
          field: 'isAccessRevoked',
          type: CRUD_COLUMN_TYPE.BOOLEAN
        },
        {
          header: this.literals?.['COLS']['IS_REFRESH_REVOKED'],
          field: 'isRefreshRevoked',
          type: CRUD_COLUMN_TYPE.BOOLEAN
        },
        {
          header: this.literals?.['COLS']['REVOKED_AT'],
          field: 'revokedAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } },
          headerStyles: 'min-width: 165px',
          fieldStyles: 'min-width: 165px',
        },
        {
          header: this.literals?.['COLS']['CREATED_AT'],
          field: 'createdAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } },
          headerStyles: 'min-width: 165px',
          fieldStyles: 'min-width: 165px',
        },
        {
          header: this.literals?.['COLS']['UPDATED_AT'],
          field: 'updatedAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } },
          headerStyles: 'min-width: 165px',
          fieldStyles: 'min-width: 165px',
        },
      ],
      globalFilterFields: ['user'],
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
      literals: {
        TITLE: this.literals?.['TITLE']
      },
      disabledButtons: {
        [CRUD_ACTIONS.EXPORT]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.GLOBAL_FILTER]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.DELETE]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.DELETE),
        [CRUD_ACTIONS.DELETE_MULTIPLE]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.DELETE_BULK),
        [CRUD_ACTIONS.CLEAR_FILTERS]: () => {
          return (
            !this.userService.hasPermission(PERMISSIONS.USERS, PERMISSION_TYPE.READ) ||
            Object.values(cleanObject(this.filtersValue))?.length === MAGIC_NUMBERS.N_0
          );
        },
        [CRUD_ACTIONS.SEARCH_FILTERS]: () => !this.userService.hasPermission(PERMISSIONS.USERS, PERMISSION_TYPE.READ),
      }
    };
  }
}
