import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionsFormComponent } from '@modules/administrator/components';
import { PermissionsService } from '@modules/administrator/services';
import { CrudComponent } from '@shared/components';
import { CRUD_ACTIONS, CRUD_DELETE_TABLE_ACTION, CRUD_EDIT_TABLE_ACTION, DATES, MAGIC_NUMBERS, PERMISSIONS } from '@shared/constants';
import { CRUD_COLUMN_TYPE, CRUD_STATE, PERMISSION_TYPE } from '@shared/enums';
import { ICrudComponent, ICrudPaginationEvent, ICrudTableAction, IPaginationQuery, IPaginationResponse, IPermission, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfirmDialogService, SpinnerService, ToastService, TranslateService, UserService } from '@shared/services';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-permissions',
  standalone: true,
  templateUrl: './permissions.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CrudComponent,
    PermissionsFormComponent
  ]
})
export class PermissionsComponent {
  public showTable = false;
  public crudValues: IPermission[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;
  public selectedItem: IPermission;
  public formValid: boolean = false;

  private literals: ITranslateLiterals;
  private selectedItemId: string;
  private paginationQuery: IPaginationQuery = { page: MAGIC_NUMBERS.N_1, limit: MAGIC_NUMBERS.N_5 };

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private permissionsService = inject(PermissionsService);
  private confirmDialogService = inject(ConfirmDialogService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);
  private spinnerService = inject(SpinnerService);
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.translateService.stream('PERMISSIONS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCrudConfig();
        this.getValues();
      });
  }

  public onNew(): void {
    this.selectedItem = {
      name: '',
      type: '' as PERMISSION_TYPE,
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
        this.permissionsService.deleteMultiple(values)
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

    const permissionFormValue: IPermission = structuredClone(this.selectedItem);
    permissionFormValue.type = permissionFormValue.type?.['type'] ?? permissionFormValue.type;
    if (this.crudState === CRUD_STATE.NEW) {
      this.add(permissionFormValue);
    } else {
      this.edit(this.selectedItemId, permissionFormValue);
    }
  }

  public onPagination(paginationEvent: ICrudPaginationEvent): void {
    this.paginationQuery.page = paginationEvent.page;
    this.paginationQuery.limit = paginationEvent.limit;
    this.getValues();
  }

  private getValues(): void {
    this.showTable = false;
    this.permissionsService.find(null, this.paginationQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.showTable = true)
      )
      .subscribe((res: IPaginationResponse<IPermission>) => {
        this.crudValues = res?.data ?? [];
        this.crudConfig.pagination.totalRecords = res?.totalRecords;
        this.crudConfig.pagination.first = res?.first;
        this.crudConfig.pagination.rows = res?.limit;
      });
  }

  private add(value: IPermission): void {
    this.spinnerService.show();
    this.permissionsService.save(value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IPermission) => {
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

  private delete(value: IPermission): void {
    if (!value) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE']?.['HEADER'],
      message: `${this.literals?.['DELETE']?.['MESSAGE']}<br><br><center>${value.name} - ${value.type}</center>`,
      rejectButton: { label: this.literals?.['DELETE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.permissionsService.delete(value)
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

  private edit(_id: string, value: IPermission): void {
    this.spinnerService.show();
    this.permissionsService.update(_id, value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IPermission) => {
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
          header: this.literals?.['COLS']['NAME'],
          field: 'name'
        },
        {
          header: this.literals?.['COLS']['TYPE'],
          field: 'type'
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
      globalFilterFields: ['name', 'type'],
      dataKey: '_id',
      titleKeys: ['name', 'type'],
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
      exportFilename: 'permissions',
      disableSubmitButton: () => !this.formValid,
      literals: {
        TITLE: this.literals?.['TITLE'],
        FORM_NEW: this.literals?.['FORM_NEW'],
        FORM_EDIT: this.literals?.['FORM_EDIT']
      },
      disabledButtons: {
        [CRUD_ACTIONS.NEW]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.CREATE),
        [CRUD_ACTIONS.DELETE_MULTIPLE]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.DELETE_BULK),
        [CRUD_ACTIONS.EXPORT]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.GLOBAL_FILTER]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.EDIT]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.UPDATE),
        [CRUD_ACTIONS.DELETE]: () => !this.userService.hasPermission(PERMISSIONS.PERMISSIONS, PERMISSION_TYPE.DELETE)
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
