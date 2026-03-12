import { CommonModule } from '@angular/common';
import { Component, inject, input, output, ViewChild } from '@angular/core';
import { DATES, MAGIC_NUMBERS } from '@shared/constants';
import { BUTTON_SEVERITY, CRUD_COLUMN_ALIGNMENT, CRUD_COLUMN_TYPE, JSON_EDITOR_HEIGHT_UNIT, JSON_EDITOR_MODE, JSON_EDITOR_TYPE } from '@shared/enums';
import { ICrudColumn, ICrudComponent, ICrudTableAction, IJsonEditorDialogComponent } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { DatesService, TranslateService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { JsonEditorDialogComponent } from '../json-editor-dialog';

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
    InputTextModule,
    TooltipModule,
    JsonEditorDialogComponent,
  ]
})
export class CrudComponent {

  @ViewChild('dt') dt!: Table;

  public data = input<any[]>([]);
  public config = input<ICrudComponent>({
    title: '',
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

  public jsonEditorDialogConfig: IJsonEditorDialogComponent;
  public jsonEditorValue: any;

  public get tableActionsEnabled(): boolean {
    return this.config()?.tableActions?.length > MAGIC_NUMBERS.N_0;
  }

  private translateService = inject(TranslateService);
  private datesService = inject(DatesService);

  public onNew(): void {
    this.new.emit();
  }

  public onDeleteMultiple(): void {
    if (!this.selectedMultipleData?.length) {
      return;
    }

    const values = this.selectedMultipleData.map((val) => val[this.config().dataKey ?? '_id']);
    this.deleteMultiple.emit(values ?? []);
    this.selectedMultipleData = [];
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

  public openJsonEditorDialog(value: any, col: ICrudColumn): void {
    this.jsonEditorDialogConfig = {
      dialogConfig: {
        closeOnSubmit: false,
        header: {
          closable: true,
          title: `${col.header} - ${value[this.config().dataKey ?? '_id']}`,
          subTitle: ''
        },
        footer: {
          cancelButton: {
            show: true,
            label: this.translateService.instant('CRUD.JSON_EDITOR_CLOSE'),
            severity: BUTTON_SEVERITY.SECONDARY,
            outlined: true,
            text: false,
            rounded: false,
            disabled: undefined
          },
          submitButton: {
            show: false,
            label: '',
            severity: BUTTON_SEVERITY.PRIMARY,
            outlined: true,
            text: false,
            rounded: false,
            disabled: undefined
          }
        }
      },
      jsonConfig: {
        height: MAGIC_NUMBERS.N_400,
        heightUnit: JSON_EDITOR_HEIGHT_UNIT.PIXELS,
        type: col.type as unknown as JSON_EDITOR_TYPE,
        mode: JSON_EDITOR_MODE.VIEW
      }
    };
    this.jsonEditorValue = value[col.field] ?? undefined;
  }
}