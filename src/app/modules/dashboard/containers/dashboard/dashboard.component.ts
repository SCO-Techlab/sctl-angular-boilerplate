import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CrudComponent } from '@shared/components';
import { CONFIRM_DIALOG_ICONS, CRUD_DEFAULT_ACTIONS, DATES, MAGIC_NUMBERS } from '@shared/constants';
import { BUTTON_SEVERITY, CRUD_COLUMN_TYPE } from '@shared/enums';
import { ICrudComponent, ICrudTableAction, IMenuFront } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfirmDialogService, MenuFrontService, ToastService, TranslateService } from '@shared/services';

@Component({
  selector: 'sctl-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    TranslateModule,
    CrudComponent
  ]
})
export class DashboardComponent implements OnInit {

  public menuFronts: IMenuFront[] = [];
  public crudConfig: ICrudComponent;

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private menuService = inject(MenuFrontService);
  private confirmDialogService = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.getValues();
    this.crudConfig = {
      title: 'Manage menu front',
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
        { header: 'Link', field: 'link' },
        { header: 'Items', field: 'items', type: CRUD_COLUMN_TYPE.ARRAY_OBJECT },
        { header: 'Roles', field: 'roles' },
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

  public onNew(): void {
    console.log('onNew');
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
      edit: this.edit.bind(this),
      delete: this.delete.bind(this)
    };

    actionMethods?.[action.name]?.(action.value);
  }

  private getValues(): void {
    this.menuService.find()
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IMenuFront[]) => this.menuFronts = res ?? []);
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

  private edit(value: IMenuFront): void {
    console.log(value);
  }
}
