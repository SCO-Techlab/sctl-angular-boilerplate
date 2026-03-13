import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrudComponent, JsonEditorComponent } from '@shared/components';
import { CONFIRM_DIALOG_ICONS, CRUD_DEFAULT_ACTIONS, DATES, MAGIC_NUMBERS } from '@shared/constants';
import { BUTTON_SEVERITY, CRUD_COLUMN_TYPE, CRUD_STATE, JSON_EDITOR_HEIGHT_UNIT, JSON_EDITOR_MODE, JSON_EDITOR_TYPE } from '@shared/enums';
import { ICrudComponent, ICrudTableAction, IJsonEditorComponent, IMenuFront, IRole } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfirmDialogService, MenuFrontService, ToastService, TranslateService } from '@shared/services';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'sctl-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CrudComponent,
    InputTextModule,
    ToggleSwitchModule,
    InputNumberModule,
    MultiSelectModule,
    JsonEditorComponent
  ]
})
export class DashboardComponent implements OnInit {

  public readonly VIEW_STATE = CRUD_STATE.VIEW;
  public menuFronts: IMenuFront[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;
  public menuFrontForm: FormGroup;
  public roleOptions: { name: string; _id: string }[] = [];
  public jsonEditorConfig: IJsonEditorComponent;

  private selectedItem: IMenuFront;

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
    this.setCrudConfig();
    this.setJsonEditorConfig();
  }

  public onNew(): void {
    this.selectedItem = undefined;
    this.menuFrontForm.reset({
      label: '',
      separator: false,
      icon: '',
      routerLink: '',
      items: [],
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
      header: 'Eliminar elementos de menú',
      message: '¿Está seguro de que desea eliminar los elementos de menú seleccionados?',
      icon: CONFIRM_DIALOG_ICONS.WARNING,
      rejectButton: {
        label: 'Cancelar',
        severity: BUTTON_SEVERITY.SECONDARY
      },
      acceptButton: {
        label: 'Eliminar',
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
                  detail: 'Hubo un error intentando eliminar los elementos de menú'
                });
                return;
              }

              if (res !== values.length) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: `Hubo un error intentando eliminar los elementos de menú (${res}/${values.length})`
                });
              } else {
                this.toastService.success({
                  summary: this.translateService.instant('TOAST.SUCCESS'),
                  detail: 'Los elementos de menú se han eliminado correctamente'
                });
              }
              this.getValues();
              this.crudState = CRUD_STATE.VIEW;
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: 'Hubo un error intentando eliminar los elementos de menú'
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
      console.log(this.selectedItem);
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
              detail: 'Hubo un error intentando añadir el elemento de menú'
            });
            return;
          }

          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: 'El elemento de menú se ha añadido correctamente'
          });
          this.getValues();
          this.crudState = CRUD_STATE.VIEW;
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: 'Hubo un error intentando añadir el elemento de menú'
          });
        }
      });
  }

  private delete(value: IMenuFront): void {
    if (!value) {
      return;
    }

    this.confirmDialogService.confirm({
      header: 'Eliminar elemento de menú',
      message: '¿Está seguro de que desea eliminar el elemento menú?',
      icon: CONFIRM_DIALOG_ICONS.WARNING,
      rejectButton: {
        label: 'Cancelar',
        severity: BUTTON_SEVERITY.SECONDARY
      },
      acceptButton: {
        label: 'Eliminar',
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
                  detail: 'Hubo un error intentando eliminar el elemento de menú'
                });
                return;
              }

              this.toastService.success({
                summary: this.translateService.instant('TOAST.SUCCESS'),
                detail: 'El elemento de menú se ha eliminado correctamente'
              });
              this.getValues();
              this.crudState = CRUD_STATE.VIEW;
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: 'Hubo un error intentando eliminar el elemento de menú'
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
              detail: 'Hubo un error intentando actualizar el elemento de menú'
            });
            return;
          }

          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: 'El elemento de menú se ha actualizado correctamente'
          });
          this.getValues();
          this.selectedItem = undefined;
          this.crudState = CRUD_STATE.VIEW;
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: 'Hubo un error intentando actualizar el elemento de menú'
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
      order: new FormControl<number>(MAGIC_NUMBERS.N_0)
    });
  }

  private fillForm(value: IMenuFront): void {
    this.menuFrontForm.setValue({
      label: value.label ?? '',
      separator: value.separator ?? false,
      icon: value.icon ?? '',
      routerLink: value.routerLink ?? '',
      items: value.items ?? [],
      roles: value.roles ? value.roles.map(role => ({ name: role.name, _id: role._id })) : [],
      order: value.order ?? MAGIC_NUMBERS.N_0
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
        { header: 'Label', field: 'label' },
        { header: 'Separator', field: 'separator', type: CRUD_COLUMN_TYPE.BOOLEAN },
        { header: 'Icon', field: 'icon', type: CRUD_COLUMN_TYPE.ICON },
        { header: 'Link', field: 'routerLink' },
        { header: 'Items', field: 'items', type: CRUD_COLUMN_TYPE.ARRAY_OBJECT },
        { header: 'Roles', field: 'roles', type: CRUD_COLUMN_TYPE.ARRAY_OBJECT },
        { header: 'Order', field: 'order' },
        { header: 'Created At', field: 'createdAt', type: CRUD_COLUMN_TYPE.DATE, options: { date: { format: DATES.ISO_DATE } } },
        { header: 'Updated At', field: 'updatedAt', type: CRUD_COLUMN_TYPE.DATE, options: { date: { format: DATES.ISO_DATE } } },
      ],
      globalFilterFields: ['label'],
      dataKey: '_id',
      rowsPerPageOptions: [MAGIC_NUMBERS.N_5, MAGIC_NUMBERS.N_10, MAGIC_NUMBERS.N_20, MAGIC_NUMBERS.N_30],
      rowsPerPage: MAGIC_NUMBERS.N_5,
      rowHover: true,
      paginator: true,
      showCurrentPageReport: true,
      exportFilename: 'menu-front'
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
}
