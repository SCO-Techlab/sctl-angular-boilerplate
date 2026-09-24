import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CrudComponent } from '@core/components';
import { ConfirmDialogService, CRUD_ACTIONS, CRUD_COLUMN_TYPE, CRUD_DELETE_TABLE_ACTION, CRUD_EDIT_TABLE_ACTION, CRUD_STATE, DATES, DatesService, ICrudComponent, ICrudPaginationEvent, ICrudTableAction, IPaginationQuery, IPaginationResponse, ITranslateLiterals, MAGIC_NUMBERS, SpinnerService, ToastService, TranslateModule, TranslateService, XlsxService } from '@core/shared';
import { PERMISSIONS } from '@shared/constants';
import { PERMISSION_TYPE } from '@shared/enums/permissions/permissions.enum';
import { cleanObject } from '@shared/helpers';
import { SelectTenantService, UserService } from '@shared/services';
import { finalize } from 'rxjs';
import { ResidencesFiltersFormComponent, ResidencesFormComponent } from '../../components';
import { IResidence } from '../../interfaces';
import { ResidencesService } from '../../services';

@Component({
  selector: 'sctl-residences',
  standalone: true,
  templateUrl: './residences.component.html',
  imports: [
    TranslateModule,
    CrudComponent,
    ResidencesFormComponent,
    ResidencesFiltersFormComponent
  ]
})
export class ResidencesComponent {
  @ViewChild('filtersForm', { static: false }) filtersForm!: ResidencesFiltersFormComponent;

  public showTable = false;
  public crudValues: IResidence[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;
  public selectedItem: IResidence;
  public formValid: boolean = false;
  public filtersValue: Partial<IResidence> = {};

  private literals: ITranslateLiterals;
  private selectedItemId: string;
  private paginationQuery: IPaginationQuery = { page: MAGIC_NUMBERS.N_1, limit: MAGIC_NUMBERS.N_5 };

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly residencesService = inject(ResidencesService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly xlsxService = inject(XlsxService);
  private readonly datesService = inject(DatesService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly selectTenantService = inject(SelectTenantService);

  ngOnInit() {
    this.translateService.stream('RESIDENCES')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCrudConfig();
        this.getValues();
      });

    this.selectTenantService.onTenantChange$
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.resetCrud());
  }

  public onNew(): void {
    this.selectedItem = {
      tenant: undefined,
      street: '',
      number: '',
      flat: '',
      door: '',
      city: '',
      province: '',
      postalCode: '',
      cadastre: '',
      description: '',
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
        this.residencesService.deleteMultiple(values)
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
    const values = await new Promise<IResidence[]>((resolve) => {
      this.residencesService.find(null)
        .pipe(takeUntilDestroyed(this.destroyRef$))
        .subscribe({
          next: (res: IResidence[]) => resolve(res ?? []),
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

    const formatData = values.map((item: IResidence) => {
      return {
        ['_id']: item._id,
        [this.literals?.['COLS']['TENANT']]: item.tenant?.name ?? '',
        [this.literals?.['COLS']['STREET']]: item.street ?? '',
        [this.literals?.['COLS']['NUMBER']]: item.number ?? '',
        [this.literals?.['COLS']['FLAT']]: item.flat ?? '',
        [this.literals?.['COLS']['DOOR']]: item.door ?? '',
        [this.literals?.['COLS']['CITY']]: item.city ?? '',
        [this.literals?.['COLS']['PROVINCE']]: item.province ?? '',
        [this.literals?.['COLS']['POSTAL_CODE']]: item.postalCode ?? '',
        [this.literals?.['COLS']['CADASTRE']]: item.cadastre ?? '',
        [this.literals?.['COLS']['DESCRIPTION']]: item.description ?? '',
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

  public onFormValueChange($event: { value: IResidence, imagesChanged: boolean }): void {
    this.selectedItem = structuredClone($event.value);

    if ($event.imagesChanged) {
      this.getValues();
    }
  }

  public onCloseFormDialog(isSubmit: boolean): void {
    if (!isSubmit) {
      this.selectedItem = undefined;
      this.selectedItemId = undefined;
      this.crudState = CRUD_STATE.VIEW;
      this.cdRef.detectChanges();
      return;
    }

    const formValue: IResidence = structuredClone(this.selectedItem);
    const currentTenant = this.userService.userTenants().find(t => t._id === this.selectTenantService.selectedTenant);
    formValue.tenant = currentTenant;
    if (this.crudState === CRUD_STATE.NEW) {
      this.add(formValue);
    } else {
      this.edit(this.selectedItemId, formValue);
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
    const filter: Partial<IResidence> = Object.values(cleanObject(this.filtersValue))?.length
      ? this.filtersValue
      : null;
    this.residencesService.find(filter, this.paginationQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.showTable = true)
      )
      .subscribe((res: IPaginationResponse<IResidence>) => {
        this.crudValues = res?.data ?? [];
        this.crudConfig.pagination.totalRecords = res?.totalRecords;
        this.crudConfig.pagination.first = res?.first;
        this.crudConfig.pagination.rows = res?.limit;
      });
  }

  private add(value: IResidence): void {
    this.spinnerService.show();
    this.residencesService.save(value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IResidence) => {
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
        error: (error: HttpErrorResponse) => this.errorAddOrEdit(error, false)
      });
  }

  private delete(value: IResidence): void {
    if (!value) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE']?.['HEADER'],
      message: `${this.literals?.['DELETE']?.['MESSAGE']}<br><br><center>${value.street} - ${value.number} - ${value.door}</center>`,
      rejectButton: { label: this.literals?.['DELETE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.residencesService.delete(value)
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

  private edit(_id: string, value: IResidence): void {
    this.spinnerService.show();
    this.residencesService.update(_id, value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IResidence) => {
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
        error: (error: HttpErrorResponse) => this.errorAddOrEdit(error, true)
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
          header: this.literals?.['COLS']['STREET'],
          field: 'street'
        },
        {
          header: this.literals?.['COLS']['NUMBER'],
          field: 'number'
        },
        {
          header: this.literals?.['COLS']['FLAT'],
          field: 'flat'
        },
        {
          header: this.literals?.['COLS']['DOOR'],
          field: 'door'
        },
        {
          header: this.literals?.['COLS']['CITY'],
          field: 'city'
        },
        {
          header: this.literals?.['COLS']['PROVINCE'],
          field: 'province'
        },
        {
          header: this.literals?.['COLS']['POSTAL_CODE'],
          field: 'postalCode'
        },
        {
          header: this.literals?.['COLS']['CADASTRE'],
          field: 'cadastre'
        },
        {
          header: this.literals?.['COLS']['DESCRIPTION'],
          field: 'description'
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
      globalFilterFields: ['street', 'number', 'flat', 'door', 'city', 'province', 'postalCode', 'cadastre'],
      dataKey: '_id',
      titleKeys: ['street', 'number', 'flat', 'door', 'city', 'province', 'postalCode'],
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
        [CRUD_ACTIONS.NEW]: () => !this.userService.hasPermission(PERMISSIONS.RESIDENCES, PERMISSION_TYPE.CREATE),
        [CRUD_ACTIONS.DELETE_MULTIPLE]: () => !this.userService.hasPermission(PERMISSIONS.RESIDENCES, PERMISSION_TYPE.DELETE_BULK),
        [CRUD_ACTIONS.EXPORT]: () => !this.userService.hasPermission(PERMISSIONS.RESIDENCES, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.GLOBAL_FILTER]: () => !this.userService.hasPermission(PERMISSIONS.RESIDENCES, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.EDIT]: () => !this.userService.hasPermission(PERMISSIONS.RESIDENCES, PERMISSION_TYPE.UPDATE),
        [CRUD_ACTIONS.DELETE]: () => !this.userService.hasPermission(PERMISSIONS.RESIDENCES, PERMISSION_TYPE.DELETE),
        [CRUD_ACTIONS.CLEAR_FILTERS]: () => {
          return (
            !this.userService.hasPermission(PERMISSIONS.RESIDENCES, PERMISSION_TYPE.READ) ||
            Object.values(cleanObject(this.filtersValue))?.length === MAGIC_NUMBERS.N_0
          );
        },
        [CRUD_ACTIONS.SEARCH_FILTERS]: () => !this.userService.hasPermission(PERMISSIONS.RESIDENCES, PERMISSION_TYPE.READ),
      }
    };
  }

  private resetCrud(): void {
    this.getValues();
    this.selectedItem = undefined;
    this.selectedItemId = undefined;
    this.crudState = CRUD_STATE.VIEW;
  }

  private errorAddOrEdit(error: HttpErrorResponse, isEdit: boolean): void {
    const translateBlock: string = isEdit ? 'EDIT' : 'ADD';
    const errorMessage: string = (error.error?.message as string);
    const duplicatedKeyError: string = 'Duplicate key error collection';
    let detail: string = this.literals?.[translateBlock]?.['ERROR'];

    if (errorMessage?.startsWith(duplicatedKeyError)) {
      const split: string[] = errorMessage?.split(duplicatedKeyError);
      detail = `${this.literals?.[translateBlock]?.['DUPLICATE']} ${split?.[MAGIC_NUMBERS.N_1]}`;
    }

    this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail });
  }
}
