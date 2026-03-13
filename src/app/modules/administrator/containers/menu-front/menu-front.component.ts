import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuFrontFormComponent } from '@modules/administrator/components';
import { CrudComponent } from '@shared/components';
import { CONFIRM_DIALOG_ICONS, CRUD_ACTIONS, CRUD_DELETE_TABLE_ACTION, CRUD_EDIT_TABLE_ACTION, DATES, MAGIC_NUMBERS, ROLES } from '@shared/constants';
import { BUTTON_SEVERITY, CRUD_COLUMN_TYPE, CRUD_STATE } from '@shared/enums';
import { ICrudComponent, ICrudTableAction, IMenuFront, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfirmDialogService, MenuFrontService, ToastService, TranslateService, UserService } from '@shared/services';

@Component({
  selector: 'sctl-menu-front',
  standalone: true,
  templateUrl: './menu-front.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CrudComponent,
    MenuFrontFormComponent
  ]
})
export class MenuFrontComponent {
  public crudValues: IMenuFront[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;
  public selectedItem: IMenuFront;
  public formValid: boolean = false;

  private literals: ITranslateLiterals;
  private selectedItemId: string;

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private menuService = inject(MenuFrontService);
  private confirmDialogService = inject(ConfirmDialogService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.getValues();
    this.translateService.stream('MENU_FRONT')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCrudConfig();
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
      icon: CONFIRM_DIALOG_ICONS.WARNING,
      rejectButton: {
        label: this.literals?.['DELETE_MULTIPLE']?.['CANCEL'],
        severity: BUTTON_SEVERITY.SECONDARY
      },
      acceptButton: {
        label: this.literals?.['DELETE_MULTIPLE']?.['SUBMIT'],
        severity: BUTTON_SEVERITY.DANGER
      },
      accept: () => {
        this.menuService.deleteMultiple(values)
          .pipe(takeUntilDestroyed(this.destroyRef$))
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

    const menuFormValue: IMenuFront = structuredClone(this.selectedItem);
    menuFormValue.roles = menuFormValue.roles?.map(role => role._id) ?? [];
    if (this.crudState === CRUD_STATE.NEW) {
      this.add(menuFormValue);
    } else {
      this.edit(this.selectedItemId, menuFormValue);
    }
  }

  private getValues(): void {
    this.menuService.find()
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IMenuFront[]) => this.crudValues = res ?? []);
  }

  private add(value: IMenuFront): void {
    this.menuService.save(value)
      .pipe(takeUntilDestroyed(this.destroyRef$))
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
      message: this.literals?.['DELETE']?.['MESSAGE'],
      icon: CONFIRM_DIALOG_ICONS.WARNING,
      rejectButton: {
        label: this.literals?.['DELETE']?.['CANCEL'],
        severity: BUTTON_SEVERITY.SECONDARY
      },
      acceptButton: {
        label: this.literals?.['DELETE']?.['SUBMIT'],
        severity: BUTTON_SEVERITY.DANGER
      },
      accept: () => {
        this.menuService.delete(value)
          .pipe(takeUntilDestroyed(this.destroyRef$))
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
    this.menuService.update(_id, value)
      .pipe(takeUntilDestroyed(this.destroyRef$))
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
      onlyTable: false,
      tableActions: [
        { ...CRUD_EDIT_TABLE_ACTION, disabled: this.userIsNotSuperadmin.bind(this) },
        { ...CRUD_DELETE_TABLE_ACTION, disabled: this.userIsNotSuperadmin.bind(this) }
      ],
      newValueButtonEnabled: true,
      multipleDeleteButtonEnabled: true,
      exportButtonEnabled: true,
      searchInputEnabled: true,
      cols: [
        { header: this.literals?.['COLS']['LABEL'], field: 'label' },
        { header: this.literals?.['COLS']['SEPARATOR'], field: 'separator', type: CRUD_COLUMN_TYPE.BOOLEAN },
        { header: this.literals?.['COLS']['ICON'], field: 'icon', type: CRUD_COLUMN_TYPE.ICON },
        { header: this.literals?.['COLS']['LINK'], field: 'routerLink' },
        { header: this.literals?.['COLS']['ITEMS'], field: 'items', type: CRUD_COLUMN_TYPE.ARRAY_OBJECT, headerStyles: 'max-width: 5rem', fieldStyles: 'max-width: 5rem' },
        { header: this.literals?.['COLS']['ROLES'], field: 'roles', type: CRUD_COLUMN_TYPE.ARRAY_OBJECT, headerStyles: 'max-width: 5rem', fieldStyles: 'max-width: 5rem' },
        { header: this.literals?.['COLS']['ORDER'], field: 'order' },
        { header: this.literals?.['COLS']['CREATED_AT'], field: 'createdAt', type: CRUD_COLUMN_TYPE.DATE, options: { date: { format: DATES.ISO_DATE } } },
        { header: this.literals?.['COLS']['UPDATED_AT'], field: 'updatedAt', type: CRUD_COLUMN_TYPE.DATE, options: { date: { format: DATES.ISO_DATE } } },
      ],
      globalFilterFields: ['label'],
      dataKey: '_id',
      rowsPerPageOptions: [MAGIC_NUMBERS.N_5, MAGIC_NUMBERS.N_10, MAGIC_NUMBERS.N_20, MAGIC_NUMBERS.N_30],
      rowsPerPage: MAGIC_NUMBERS.N_5,
      rowHover: true,
      paginator: true,
      showCurrentPageReport: true,
      exportFilename: 'menu-front',
      disableSubmitButton: () => { return !this.formValid; },
      literals: {
        TITLE: this.literals?.['TITLE'],
        FORM_NEW: this.literals?.['FORM_NEW'],
        FORM_EDIT: this.literals?.['FORM_EDIT']
      },
      disabledButtons: {
        [CRUD_ACTIONS.NEW]: this.userIsNotSuperadmin.bind(this),
        [CRUD_ACTIONS.DELETE_MULTIPLE]: this.userIsNotSuperadmin.bind(this),
        [CRUD_ACTIONS.EXPORT]: this.userIsNotSuperadmin.bind(this),
        [CRUD_ACTIONS.GLOBAL_FILTER]: this.userIsNotSuperadmin.bind(this),
        [CRUD_ACTIONS.EDIT]: this.userIsNotSuperadmin.bind(this),
        [CRUD_ACTIONS.DELETE]: this.userIsNotSuperadmin.bind(this)
      }
    };
  }

  private resetCrud(): void {
    this.getValues();
    this.selectedItem = undefined;
    this.selectedItemId = undefined;
    this.crudState = CRUD_STATE.VIEW;
  }

  private userIsNotSuperadmin(): boolean {
    return this.userService.loggedUser()?.role?.name !== ROLES.SUPERADMIN;
  }
}
