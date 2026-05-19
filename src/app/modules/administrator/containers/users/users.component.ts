import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EditPasswordDialogComponent, UsersFiltersFormComponent, UsersFormComponent } from '@modules/administrator/components';
import { UsersService } from '@modules/administrator/services';
import { CrudComponent, UserAvatarComponent } from '@shared/components';
import { CRUD_ACTIONS, CRUD_DEFAULT_TABLE_ACTION, CRUD_DELETE_TABLE_ACTION, CRUD_EDIT_TABLE_ACTION, DATES, MAGIC_NUMBERS, PERMISSIONS, ROLES } from '@shared/constants';
import { CrudTemplateDirective } from '@shared/directives';
import { BUTTON_SEVERITY, CRUD_COLUMN_ALIGNMENT, CRUD_COLUMN_TYPE, CRUD_STATE, PERMISSION_TYPE } from '@shared/enums';
import { cleanObject } from '@shared/helpers';
import { ICrudComponent, ICrudPaginationEvent, ICrudTableAction, IDialogComponent, IPaginationQuery, IPaginationResponse, ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfirmDialogService, DatesService, SpinnerService, ToastService, TranslateService, UserService, XlsxService } from '@shared/services';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-users',
  standalone: true,
  templateUrl: './users.component.html',
  imports: [
    TranslateModule,
    CrudComponent,
    CrudTemplateDirective,
    UsersFormComponent,
    EditPasswordDialogComponent,
    UserAvatarComponent,
    UsersFiltersFormComponent
  ]
})
export class UsersComponent {
  @ViewChild('filtersForm', { static: false }) filtersForm!: UsersFiltersFormComponent;

  public showTable = false;
  public crudValues: IUser[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;
  public selectedItem: IUser;
  public formValid: boolean = false;
  public editPasswordVisible: boolean = false;
  public editPasswordConfig: IDialogComponent;
  public editPasswordFormValid: boolean = false;
  public filtersValue: Partial<IUser> = {};

  private literals: ITranslateLiterals;
  private selectedItemId: string;
  private paginationQuery: IPaginationQuery = { page: MAGIC_NUMBERS.N_1, limit: MAGIC_NUMBERS.N_5 };

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private usersService = inject(UsersService);
  private confirmDialogService = inject(ConfirmDialogService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);
  private spinnerService = inject(SpinnerService);
  private xlsxService = inject(XlsxService);
  private datesService = inject(DatesService);
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.translateService.stream('USERS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCrudConfig();
        this.setEditPasswordDialog();
        this.getValues();
      });
  }

  public onNew(): void {
    this.selectedItem = {
      email: '',
      password: '',
      userName: '',
      personalName: '',
      active: false,
      role: null,
      emailConfirmed: false,
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
        this.usersService.deleteMultiple(values)
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
    const values = await new Promise<IUser[]>((resolve) => {
      this.usersService.find(null)
        .pipe(takeUntilDestroyed(this.destroyRef$))
        .subscribe({
          next: (res: IUser[]) => resolve(res ?? []),
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
    const formatData = values.map((item: IUser) => {
      return {
        ['_id']: item._id,
        [this.literals?.['COLS']['EMAIL']]: item.email,
        [this.literals?.['COLS']['USER_NAME']]: item.userName,
        [this.literals?.['COLS']['PERSONAL_NAME']]: item.personalName,
        [this.literals?.['COLS']['ACTIVE']]: item.active ? yes : no,
        [this.literals?.['COLS']['EMAIL_CONFIRMED']]: item.emailConfirmed ? yes : no,
        [this.literals?.['COLS']['EMAIL_CONFIRMED_AT']]: item.emailConfirmedAt ? this.datesService.formatDate(DATES.ISO_DATETIME, item.emailConfirmedAt) : '',
        [this.literals?.['COLS']['ROLE']]: item?.role?.name,
        [this.literals?.['COLS']['AVATAR']]: item?.avatar,
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
      ['avatar']: () => {
        this.deleteAvatar(action?.value);
      },
      ['password']: () => {
        this.selectedItem = structuredClone(action?.value);
        this.editPasswordConfig.header.subTitle = this.selectedItem.email;
        this.editPasswordVisible = true;
      },
      ['welcome']: () => {
        this.selectedItem = structuredClone(action?.value);
        this.confirmDialogService.confirm({
          header: this.literals?.['WELCOME_EMAIL']?.['HEADER'],
          message: `${this.literals?.['WELCOME_EMAIL']?.['MESSAGE']}<br><br><center>${this.selectedItem.email}</center>`,
          rejectButton: { label: this.literals?.['WELCOME_EMAIL']?.['CANCEL'] },
          acceptButton: { label: this.literals?.['WELCOME_EMAIL']?.['ACCEPT'], severity: BUTTON_SEVERITY.PRIMARY },
          accept: () => this.sendWelcomeEmail(this.selectedItem._id),
        });
      },
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

    const userFormValue: IUser = structuredClone(this.selectedItem);
    if (userFormValue.active === undefined) {
      userFormValue.active = false;
    }

    if (userFormValue.role) {
      userFormValue.role = userFormValue.role._id as any;
    }

    if (userFormValue.emailConfirmed === true && !userFormValue.emailConfirmedAt) {
      userFormValue.emailConfirmedAt = new Date();
    } else if (!userFormValue.emailConfirmed && userFormValue.emailConfirmedAt) {
      userFormValue.emailConfirmedAt = undefined;
    }

    if (this.crudState === CRUD_STATE.NEW) {
      this.add(userFormValue);
    } else {
      this.edit(this.selectedItemId, userFormValue);
    }
  }

  public onEditPassword(password: string): void {
    this.spinnerService.show();
    this.usersService.updatePassword(this.selectedItem._id, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (result: boolean) => {
          if (!result) {
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['EDIT_PASSWORD']?.['ERROR'] });
            return;
          }

          this.toastService.success({ summary: this.translateService.instant('TOAST.SUCCESS'), detail: this.literals['EDIT_PASSWORD']?.['SUCCESS'] });
          this.editPasswordVisible = false;
          this.selectedItem = undefined;
        },
        error: () => {
          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['EDIT_PASSWORD']?.['ERROR'] });
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
    const filter: Partial<IUser> = Object.values(cleanObject(this.filtersValue))?.length
      ? this.filtersValue
      : null;
    this.usersService.find(filter, this.paginationQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.showTable = true)
      )
      .subscribe((res: IPaginationResponse<IUser>) => {
        this.crudValues = res?.data ?? [];
        this.crudConfig.pagination.totalRecords = res?.totalRecords;
        this.crudConfig.pagination.first = res?.first;
        this.crudConfig.pagination.rows = res?.limit;
      });
  }

  private add(value: IUser): void {
    this.spinnerService.show();
    this.usersService.save(value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IUser) => {
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

  private delete(value: IUser): void {
    if (!value) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE']?.['HEADER'],
      message: `${this.literals?.['DELETE']?.['MESSAGE']}<br><br><center>${value.email}</center>`,
      rejectButton: { label: this.literals?.['DELETE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.usersService.delete(value)
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

  private edit(_id: string, value: IUser): void {
    this.spinnerService.show();
    this.usersService.update(_id, value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IUser) => {
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

  private sendWelcomeEmail(_id: string): void {
    this.spinnerService.show();
    this.usersService.sendWelcomeEmail(_id)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (result: boolean) => {
          if (!result) {
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['WELCOME_EMAIL']?.['ERROR'] });
            return;
          }

          this.toastService.success({ summary: this.translateService.instant('TOAST.SUCCESS'), detail: this.literals['WELCOME_EMAIL']?.['SUCCESS'] });
          this.selectedItem = undefined;
        },
        error: () => {
          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['WELCOME_EMAIL']?.['ERROR'] });
        }
      });
  }

  private deleteAvatar(value: IUser): void {
    if (!value) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE_AVATAR']?.['HEADER'],
      message: `${this.literals?.['DELETE_AVATAR']?.['MESSAGE']}<br><br><center>${value.email}</center>`,
      rejectButton: { label: this.literals?.['DELETE_AVATAR']?.['REJECT'] },
      acceptButton: { label: this.literals?.['DELETE_AVATAR']?.['ACCEPT'] },
      accept: () => {
        this.spinnerService.show();
        this.usersService.deleteAvatar(value?._id)
          .pipe(
            takeUntilDestroyed(this.destroyRef$),
            finalize(() => this.spinnerService.hide())
          )
          .subscribe({
            next: (res: boolean) => {
              if (!res) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: this.literals?.['DELETE_AVATAR']?.['ERROR']
                });
                return;
              }

              this.toastService.success({
                summary: this.translateService.instant('TOAST.SUCCESS'),
                detail: this.literals?.['DELETE_AVATAR']?.['SUCCESS']
              });
              this.resetCrud();
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: this.literals?.['DELETE_AVATAR']?.['ERROR']
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
          ...CRUD_DEFAULT_TABLE_ACTION,
          name: 'avatar',
          icon: 'pi pi-image',
          disabled: (value: IUser) => {
            return this.userService.loggedUser?.()?.role?.name !== ROLES.SUPERADMIN || !value?.avatar;
          }
        },
        {
          ...CRUD_DEFAULT_TABLE_ACTION,
          name: 'password',
          icon: 'pi pi-key',
          disabled: () => {
            return this.userService.loggedUser?.()?.role?.name !== ROLES.SUPERADMIN;
          }
        },
        {
          ...CRUD_DEFAULT_TABLE_ACTION,
          name: 'welcome',
          icon: 'pi pi-envelope',
          disabled: () => {
            return this.userService.loggedUser?.()?.role?.name !== ROLES.SUPERADMIN;
          }
        },
        { ...CRUD_EDIT_TABLE_ACTION },
        { ...CRUD_DELETE_TABLE_ACTION }
      ],
      newValueButtonEnabled: true,
      multipleDeleteButtonEnabled: true,
      exportButtonEnabled: true,
      searchInputEnabled: false,
      cols: [
        {
          header: this.literals?.['COLS']['AVATAR'],
          field: 'avatar',
          type: CRUD_COLUMN_TYPE.HTML,
          headerStyles: 'max-width: 5rem',
          headerAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          fieldStyles: 'max-width: 5rem',
          fieldAlign: CRUD_COLUMN_ALIGNMENT.CENTER
        },
        {
          header: this.literals?.['COLS']['EMAIL'],
          field: 'email'
        },
        {
          header: this.literals?.['COLS']['ROLE'],
          field: 'role',
          type: CRUD_COLUMN_TYPE.CALLBACK,
          options: { callback: { fn: (value: IUser) => value?.role?.name ?? '' } }
        },
        {
          header: this.literals?.['COLS']['ACTIVE'],
          field: 'active',
          type: CRUD_COLUMN_TYPE.BOOLEAN,
          options: { boolean: { booleanStatus: true } },
          headerStyles: 'max-width: 5rem',
          headerAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          fieldStyles: 'max-width: 5rem',
          fieldAlign: CRUD_COLUMN_ALIGNMENT.CENTER
        },
        {
          header: this.literals?.['COLS']['USER_NAME'],
          field: 'userName'
        },
        {
          header: this.literals?.['COLS']['PERSONAL_NAME'],
          field: 'personalName'
        },
        {
          header: this.literals?.['COLS']['EMAIL_CONFIRMED'],
          field: 'emailConfirmed',
          type: CRUD_COLUMN_TYPE.BOOLEAN,
          options: { boolean: { booleanStatus: true } },
          headerStyles: 'max-width: 7rem',
          headerAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          fieldStyles: 'max-width: 7rem',
          fieldAlign: CRUD_COLUMN_ALIGNMENT.CENTER
        },
        {
          header: this.literals?.['COLS']['EMAIL_CONFIRMED_AT'],
          field: 'emailConfirmedAt',
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
      globalFilterFields: ['email', 'userName', 'personalName'],
      dataKey: '_id',
      titleKeys: ['email'],
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
        [CRUD_ACTIONS.NEW]: () => !this.userService.hasPermission(PERMISSIONS.USERS, PERMISSION_TYPE.CREATE),
        [CRUD_ACTIONS.DELETE_MULTIPLE]: () => !this.userService.hasPermission(PERMISSIONS.USERS, PERMISSION_TYPE.DELETE_BULK),
        [CRUD_ACTIONS.EXPORT]: () => !this.userService.hasPermission(PERMISSIONS.USERS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.GLOBAL_FILTER]: () => !this.userService.hasPermission(PERMISSIONS.USERS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.EDIT]: () => !this.userService.hasPermission(PERMISSIONS.USERS, PERMISSION_TYPE.UPDATE),
        [CRUD_ACTIONS.DELETE]: () => !this.userService.hasPermission(PERMISSIONS.USERS, PERMISSION_TYPE.DELETE),
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

  private setEditPasswordDialog(): void {
    this.editPasswordConfig = {
      closeOnSubmit: false,
      header: {
        closable: true,
        title: this.literals?.['EDIT_PASSWORD']?.['TITLE'],
        subTitle: null
      },
      footer: {
        cancelButton: {
          show: true,
          label: this.literals?.['EDIT_PASSWORD']?.['CANCEL'],
          severity: BUTTON_SEVERITY.SECONDARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        },
        submitButton: {
          show: true,
          label: this.literals?.['EDIT_PASSWORD']?.['SUBMIT'],
          severity: BUTTON_SEVERITY.PRIMARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: () => { return !this.editPasswordFormValid; }
        }
      }
    }
  }
}