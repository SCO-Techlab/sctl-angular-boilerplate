import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CrudComponent } from '@shared/components';
import { CONFIRM_DIALOG_ICONS, CRUD_DEFAULT_ACTIONS, DATES, MAGIC_NUMBERS } from '@shared/constants';
import { BUTTON_SEVERITY, CRUD_COLUMN_TYPE } from '@shared/enums';
import { ICrudComponent, ICrudTableAction, IMenuFront } from '@shared/interfaces';
import { ConfirmDialogService, MenuFrontService } from '@shared/services';

@Component({
  selector: 'sctl-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CrudComponent
  ]
})
export class DashboardComponent implements OnInit {

  public menuFronts: IMenuFront[] = [];
  public crudConfig: ICrudComponent;

  private destroyRef$ = inject(DestroyRef);
  private menuService = inject(MenuFrontService);
  private confirmDialogService = inject(ConfirmDialogService);

  ngOnInit() {
    this.menuService.find()
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IMenuFront[]) => this.menuFronts = res ?? []);

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
        { header: 'Link', field: 'link' },
        { header: 'Items', field: 'items' },
        { header: 'Roles', field: 'roles' },
        { header: 'Order', field: 'order' },
        { header: 'Created At', field: 'createdAt', type: CRUD_COLUMN_TYPE.DATE, options: { date: { format: DATES.ISO_DATE } } },
      ],
      globalFilterFields: ['label'],
      dataKey: '_id',
      rowsPerPageOptions: [MAGIC_NUMBERS.N_5, MAGIC_NUMBERS.N_10, MAGIC_NUMBERS.N_20, MAGIC_NUMBERS.N_30],
      rowsPerPage: MAGIC_NUMBERS.N_5,
      rowHover: true,
      paginator: true,
      showCurrentPageReport: true
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
    });
  }

  private edit(value: IMenuFront): void {
    console.log(value);
  }
}
