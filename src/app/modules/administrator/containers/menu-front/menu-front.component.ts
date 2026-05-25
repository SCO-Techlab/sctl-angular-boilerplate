import { ChangeDetectorRef, Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CrudComponent } from '@core/components';
import { DATES, MAGIC_NUMBERS } from '@core/shared/constants';
import { ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { DatesService, SpinnerService, ToastService, TranslateService } from '@core/shared/services';
import { MenuFrontFiltersFormComponent, MenuFrontFormComponent } from '@modules/administrator/components';
import { CRUD_ACTIONS, CRUD_DELETE_TABLE_ACTION, CRUD_EDIT_TABLE_ACTION, PERMISSIONS } from '@shared/constants';
import { CRUD_COLUMN_ALIGNMENT, CRUD_COLUMN_TYPE, CRUD_STATE, PERMISSION_TYPE } from '@shared/enums';
import { cleanObject } from '@shared/helpers';
import { ICrudComponent, ICrudPaginationEvent, ICrudTableAction, IMenuFront, IPaginationQuery, IPaginationResponse } from '@shared/interfaces';
import { ConfirmDialogService, MenuFrontService, UserService, XlsxService } from '@shared/services';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-menu-front',
  standalone: true,
  templateUrl: './menu-front.component.html',
  imports: [
    TranslateModule,
    CrudComponent,
    MenuFrontFormComponent,
    MenuFrontFiltersFormComponent,
  ]
})
export class MenuFrontComponent {
  @ViewChild('filtersForm', { static: false }) filtersForm!: MenuFrontFiltersFormComponent;

  public showTable = false;
  public crudValues: IMenuFront[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;
  public selectedItem: IMenuFront;
  public formValid: boolean = false;
  public filtersValue: Partial<IMenuFront> = {};

  private literals: ITranslateLiterals;
  private selectedItemId: string;
  private paginationQuery: IPaginationQuery = { page: MAGIC_NUMBERS.N_1, limit: MAGIC_NUMBERS.N_5 };

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private menuService = inject(MenuFrontService);
  private confirmDialogService = inject(ConfirmDialogService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);
  private spinnerService = inject(SpinnerService);
  private xlsxService = inject(XlsxService);
  private datesService = inject(DatesService);
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.translateService.stream('MENU_FRONT')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCrudConfig();
        this.getValues();
      });
  }

  public onNew(): void {
    this.selectedItem = {
      label: '',
      separator: false,
      icon: '',
      routerLink: '',
      items: [{
        label: '',
        separator: false,
        icon: '',
        routerLink: '',
        items: [],
        roles: [],
        order: MAGIC_NUMBERS.N_0
      }],
      roles: [],
      order: MAGIC_NUMBERS.N_0,
    };
    this.selectedItemId = undefined;
    this.crudState = CRUD_STATE.NEW;
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
        this.menuService.deleteMultiple(values)
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
              this.resetCrud();
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

  public async onExportData(): Promise<void> {
    const values = await new Promise<IMenuFront[]>((resolve) => {
      this.menuService.find(null)
        .pipe(takeUntilDestroyed(this.destroyRef$))
        .subscribe({
          next: (res: IMenuFront[]) => resolve(res ?? []),
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
    const formatData = values.map((item: IMenuFront) => {
      return {
        ['_id']: item._id,
        [this.literals?.['COLS']['LABEL']]: item.label,
        [this.literals?.['COLS']['SEPARATOR']]: item.separator ? yes : no,
        [this.literals?.['COLS']['ICON']]: item.icon,
        [this.literals?.['COLS']['LINK']]: item.routerLink,
        [this.literals?.['COLS']['ITEMS']]: item?.items?.map((item) => item.label).join(', ') ?? '',
        [this.literals?.['COLS']['ROLES']]: item.roles ? item.roles?.map(role => role.name ?? role)?.join(', ') : '',
        [this.literals?.['COLS']['ORDER']]: item.order,
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
      [CRUD_ACTIONS.EDIT]: () => {
        this.selectedItem = structuredClone(action?.value);
        this.selectedItemId = action?.value?._id;
        this.crudState = CRUD_STATE.EDIT;
        this.cdRef.detectChanges();
      },
      [CRUD_ACTIONS.DELETE]: this.delete.bind(this)
    };

    actionMethods?.[action.name]?.(action.value);
  }

  public onCloseFormDialog(isSubmit: boolean): void {
    if (!isSubmit) {
      this.selectedItem = undefined;
      this.selectedItemId = undefined;
      this.crudState = CRUD_STATE.VIEW;
      this.cdRef.detectChanges();
      return;
    }

    const menuFormValue: IMenuFront = structuredClone(this.selectedItem);
    menuFormValue.roles = menuFormValue.roles?.map(role => role._id) ?? [];
    if (this.crudState === CRUD_STATE.NEW) {
      this.add(menuFormValue);
    } else {
      this.edit(this.selectedItemId, menuFormValue);
    }
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
    const filter: Partial<IMenuFront> = Object.values(cleanObject(this.filtersValue))?.length
      ? this.filtersValue
      : null;
    this.menuService.find(filter, this.paginationQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.showTable = true)
      )
      .subscribe((res: IPaginationResponse<IMenuFront>) => {
        this.crudValues = res?.data ?? [];
        this.crudConfig.pagination.totalRecords = res?.totalRecords;
        this.crudConfig.pagination.first = res?.first;
        this.crudConfig.pagination.rows = res?.limit;
      });
  }

  private add(value: IMenuFront): void {
    this.spinnerService.show();
    this.menuService.save(value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IMenuFront) => {
          if (!res) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['ADD']?.['ERROR']
            });
            return;
          }

          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['ADD']?.['SUCCESS']
          });
          this.resetCrud();
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['ADD']?.['ERROR']
          });
        }
      });
  }

  private delete(value: IMenuFront): void {
    if (!value) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE']?.['HEADER'],
      message: `${this.literals?.['DELETE']?.['MESSAGE']}<br><br><center>${value.label}</center>`,
      rejectButton: { label: this.literals?.['DELETE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.menuService.delete(value)
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
              this.resetCrud();
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

  private edit(_id: string, value: IMenuFront): void {
    this.spinnerService.show();
    this.menuService.update(_id, value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IMenuFront) => {
          if (!res) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['EDIT']?.['ERROR']
            });
            return;
          }

          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['EDIT']?.['SUCCESS']
          });
          this.resetCrud();
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['EDIT']?.['ERROR']
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
        { ...CRUD_EDIT_TABLE_ACTION },
        { ...CRUD_DELETE_TABLE_ACTION }
      ],
      newValueButtonEnabled: true,
      multipleDeleteButtonEnabled: true,
      exportButtonEnabled: true,
      searchInputEnabled: false,
      cols: [
        {
          header: this.literals?.['COLS']['LABEL'],
          field: 'label'
        },
        {
          header: this.literals?.['COLS']['SEPARATOR'],
          field: 'separator',
          type: CRUD_COLUMN_TYPE.BOOLEAN,
          options: { boolean: { booleanStatus: true } },
          headerStyles: 'max-width: 6rem',
          headerAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          fieldStyles: 'max-width: 6rem',
          fieldAlign: CRUD_COLUMN_ALIGNMENT.CENTER
        },
        {
          header: this.literals?.['COLS']['ICON'],
          field: 'icon',
          type: CRUD_COLUMN_TYPE.ICON,
          headerStyles: 'max-width: 5rem',
          headerAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          fieldStyles: 'max-width: 5rem',
          fieldAlign: CRUD_COLUMN_ALIGNMENT.CENTER
        },
        {
          header: this.literals?.['COLS']['LINK'],
          field: 'routerLink'
        },
        {
          header: this.literals?.['COLS']['ITEMS'],
          field: 'items',
          type: CRUD_COLUMN_TYPE.ARRAY_OBJECT,
          headerStyles: 'max-width: 5rem',
          headerAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          fieldStyles: 'max-width: 5rem',
          fieldAlign: CRUD_COLUMN_ALIGNMENT.CENTER
        },
        {
          header: this.literals?.['COLS']['ROLES'],
          field: 'roles',
          type: CRUD_COLUMN_TYPE.ARRAY,
          options: { array: { dataKey: 'name' } },
          headerStyles: 'max-width: 5rem',
          headerAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          fieldStyles: 'max-width: 5rem',
          fieldAlign: CRUD_COLUMN_ALIGNMENT.CENTER
        },
        {
          header: this.literals?.['COLS']['ORDER'],
          field: 'order',
          headerStyles: 'max-width: 5rem',
          headerAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          fieldStyles: 'max-width: 5rem',
          fieldAlign: CRUD_COLUMN_ALIGNMENT.CENTER
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
      globalFilterFields: ['label'],
      dataKey: '_id',
      titleKeys: ['label'],
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
      disableSubmitButton: () => !this.formValid,
      literals: {
        TITLE: this.literals?.['TITLE'],
        FORM_NEW: this.literals?.['FORM_NEW'],
        FORM_EDIT: this.literals?.['FORM_EDIT']
      },
      disabledButtons: {
        [CRUD_ACTIONS.NEW]: () => !this.userService.hasPermission(PERMISSIONS.MENU_FRONT, PERMISSION_TYPE.CREATE),
        [CRUD_ACTIONS.DELETE_MULTIPLE]: () => !this.userService.hasPermission(PERMISSIONS.MENU_FRONT, PERMISSION_TYPE.DELETE_BULK),
        [CRUD_ACTIONS.EXPORT]: () => !this.userService.hasPermission(PERMISSIONS.MENU_FRONT, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.GLOBAL_FILTER]: () => !this.userService.hasPermission(PERMISSIONS.MENU_FRONT, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.EDIT]: () => !this.userService.hasPermission(PERMISSIONS.MENU_FRONT, PERMISSION_TYPE.UPDATE),
        [CRUD_ACTIONS.DELETE]: () => !this.userService.hasPermission(PERMISSIONS.MENU_FRONT, PERMISSION_TYPE.DELETE),
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

  private resetCrud(): void {
    this.getValues();
    this.selectedItem = undefined;
    this.selectedItemId = undefined;
    this.crudState = CRUD_STATE.VIEW;
  }
}
