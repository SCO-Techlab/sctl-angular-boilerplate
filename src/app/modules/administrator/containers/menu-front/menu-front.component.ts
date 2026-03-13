import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrudComponent, InputErrorComponent, JsonEditorComponent } from '@shared/components';
import { CONFIRM_DIALOG_ICONS, CRUD_DEFAULT_ACTIONS, DATES, MAGIC_NUMBERS } from '@shared/constants';
import { BUTTON_SEVERITY, CRUD_COLUMN_TYPE, CRUD_STATE, INPUT_ERROR, JSON_EDITOR_HEIGHT_UNIT, JSON_EDITOR_MODE, JSON_EDITOR_TYPE } from '@shared/enums';
import { ICrudComponent, ICrudTableAction, IInputErrorComponent, IJsonEditorComponent, IMenuFront, IRole, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfirmDialogService, MenuFrontService, ToastService, TranslateService } from '@shared/services';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'sctl-menu-front',
  standalone: true,
  templateUrl: './menu-front.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CrudComponent,
    InputTextModule,
    ToggleSwitchModule,
    InputNumberModule,
    MultiSelectModule,
    JsonEditorComponent,
    InputErrorComponent
  ]
})
export class MenuFrontComponent {
  public readonly VIEW_STATE = CRUD_STATE.VIEW;
  public menuFronts: IMenuFront[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;
  public menuFrontForm: FormGroup;
  public roleOptions: { name: string; _id: string }[] = [];
  public jsonEditorConfig: IJsonEditorComponent;
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private selectedItem: IMenuFront;
  private literals: ITranslateLiterals;

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private menuService = inject(MenuFrontService);
  private confirmDialogService = inject(ConfirmDialogService);
  private toastService = inject(ToastService);
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.initForm();
    this.getValues();
    this.getRoles();
    this.translateService.stream('MENU_FRONT')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCrudConfig();
        this.setJsonEditorConfig();
        this.setFormErrors();
      });
  }

  public onNew(): void {
    this.selectedItem = undefined;
    this.menuFrontForm.reset({
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
    });
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
              this.getValues();
              this.crudState = CRUD_STATE.VIEW;
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
      edit: () => {
        this.selectedItem = structuredClone(action?.value);
        this.fillForm(this.selectedItem);
        this.crudState = CRUD_STATE.EDIT;
        this.cdRef.detectChanges();
      },
      delete: this.delete.bind(this)
    };

    actionMethods?.[action.name]?.(action.value);
  }

  public onCloseFormDialog(isSubmit: boolean): void {
    if (!isSubmit) {
      this.fillForm(this.selectedItem);
      this.selectedItem = undefined;
      this.crudState = CRUD_STATE.VIEW;
      this.cdRef.detectChanges();
      return;
    }

    const menuFormValue: IMenuFront = this.menuFrontForm.value;
    menuFormValue.roles = menuFormValue.roles?.map(role => role._id) ?? [];
    if (this.crudState === CRUD_STATE.NEW) {
      this.add(menuFormValue);
    } else {
      this.edit(this.selectedItem._id, menuFormValue);
    }
  }

  private getValues(): void {
    this.menuService.find()
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IMenuFront[]) => this.menuFronts = res ?? []);
  }

  private getRoles(): void {
    this.menuService.findMenuRoles()
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IRole[]) => {
        this.roleOptions = res?.map(role => ({ name: role.name, _id: role._id })) ?? [];
      });
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
          this.getValues();
          this.crudState = CRUD_STATE.VIEW;
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
              this.getValues();
              this.crudState = CRUD_STATE.VIEW;
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
          this.getValues();
          this.selectedItem = undefined;
          this.crudState = CRUD_STATE.VIEW;
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['EDIT']?.['ERROR']
          });
        }
      });
  }

  private initForm(): void {
    this.menuFrontForm = new FormGroup({
      label: new FormControl<string>(''),
      separator: new FormControl<boolean>(false),
      icon: new FormControl<string>(''),
      routerLink: new FormControl<string>(''),
      items: new FormControl<IMenuFront[]>([]),
      roles: new FormControl<IRole[]>([]),
      order: new FormControl<number>(MAGIC_NUMBERS.N_0, [Validators.required])
    });
  }

  private fillForm(value: IMenuFront): void {
    this.menuFrontForm.setValue({
      label: value?.label ?? '',
      separator: value?.separator ?? false,
      icon: value?.icon ?? '',
      routerLink: value?.routerLink ?? '',
      items: value?.items ?? [],
      roles: value?.roles ? value.roles.map(role => ({ name: role.name, _id: role._id })) : [],
      order: value?.order ?? MAGIC_NUMBERS.N_0
    });
  }

  private setCrudConfig(): void {
    this.crudConfig = {
      toolbarEnabled: true,
      onlyTable: false,
      tableActions: [...CRUD_DEFAULT_ACTIONS],
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
      disableSubmitButton: () => { return this.menuFrontForm.invalid; },
      literals: {
        TITLE: this.literals?.['TITLE'],
        FORM_NEW: this.literals?.['FORM_NEW'],
        FORM_EDIT: this.literals?.['FORM_EDIT']
      }
    };
  }

  private setJsonEditorConfig(): void {
    this.jsonEditorConfig = {
      height: MAGIC_NUMBERS.N_400,
      heightUnit: JSON_EDITOR_HEIGHT_UNIT.PIXELS,
      type: JSON_EDITOR_TYPE.ARRAY_OBJECT,
      mode: JSON_EDITOR_MODE.CODE,
      inputId: 'menu-front-items'
    };
  }

  private setFormErrors(): void {
    this.formErrors = {
      order: {
        formControl: this.menuFrontForm?.get?.('order'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['ORDER'] }
        ]
      }
    }
  }
}
