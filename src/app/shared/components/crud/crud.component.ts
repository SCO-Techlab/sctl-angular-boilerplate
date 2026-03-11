import { CommonModule } from '@angular/common';
import { Component, inject, input, output, ViewChild } from '@angular/core';
import { DATES, MAGIC_NUMBERS } from '@shared/constants';
import { CRUD_COLUMN_ALIGNMENT, CRUD_COLUMN_TYPE } from '@shared/enums';
import { ICrudColumn, ICrudComponent, ICrudTableAction } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { DatesService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'sctl-crud',
  standalone: true,
  templateUrl: './crud.component.html',
  imports: [
    CommonModule,
    TranslateModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule
  ]
})
export class CrudComponent {

  @ViewChild('dt') dt!: Table;

  public data = input<any[]>([]);
  public config = input<ICrudComponent>({
    toolbarEnabled: true,
    onlyTable: false,
    tableActions: [],
    newValueButtonEnabled: true,
    multipleDeleteButtonEnabled: true,
    exportButtonEnabled: true,
    searchInputEnabled: true,
    cols: [],
    globalFilterFields: [],
    dataKey: '_id',
    rowsPerPageOptions: [MAGIC_NUMBERS.N_5, MAGIC_NUMBERS.N_10, MAGIC_NUMBERS.N_20, MAGIC_NUMBERS.N_30],
    rowsPerPage: MAGIC_NUMBERS.N_5,
    rowHover: true,
    paginator: true,
    showCurrentPageReport: true
  });

  public new = output<void>();
  public deleteMultiple = output<string[]>();
  public export = output<boolean>();
  public globalFilter = output<string>();
  public selectAction = output<ICrudTableAction>();

  public readonly CRUD_COLUMN_ALIGNMENT = CRUD_COLUMN_ALIGNMENT;
  public readonly CRUD_COLUMN_TYPE = CRUD_COLUMN_TYPE;
  public readonly DATES = DATES;
  public selectedMultipleData: any[] = [];

  public get tableActionsEnabled(): boolean {
    return this.config()?.tableActions?.length > MAGIC_NUMBERS.N_0;
  }

  private datesService = inject(DatesService);

  public onNew(): void {
    this.new.emit();
  }

  public onDeleteMultiple(): void {
    if (!this.data()?.length) {
      this.deleteMultiple.emit([]);
      return;
    }

    const values: any[] = this.data()?.map((val) => val[this.config().dataKey ?? '_id']);
    if (!values?.length) {
      this.deleteMultiple.emit([]);
      return;
    }

    this.deleteMultiple.emit(values);
  }

  public onExportCSV(): void {
    let exportSuccess: boolean = true;

    try {
      this.dt.exportCSV();
    } catch {
      exportSuccess = false;
    }

    this.export.emit(exportSuccess);
  }

  public onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.globalFilter.emit((event.target as HTMLInputElement).value);
  }

  public onSelectAction(action: ICrudTableAction, value: any): void {
    this.selectAction.emit({ ...action, value });
  }

  public formatDate(date: string, col: ICrudColumn): string {
    if (!date) {
      return '';
    }

    const pattern: string = col?.options?.date?.format ?? DATES.ISO_DATE;
    return this.datesService.formatDate(pattern, date) ?? '';
  }
}