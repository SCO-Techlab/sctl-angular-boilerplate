import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, OnInit, output, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DATES, MAGIC_NUMBERS } from '@shared/constants';
import { BUTTON_SEVERITY, CRUD_COLUMN_ALIGNMENT, CRUD_COLUMN_TYPE, CRUD_STATE, JSON_EDITOR_HEIGHT_UNIT, JSON_EDITOR_MODE, JSON_EDITOR_TYPE } from '@shared/enums';
import { ICrudColumn, ICrudComponent, ICrudTableAction, IDialogComponent, IJsonEditorDialogComponent, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { DatesService, TranslateService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { DialogComponent } from '../dialog';
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
    DialogComponent,
  ]
})
export class CrudComponent implements OnInit {

  @ViewChild('dt') dt!: Table;

  public data = input<any[]>([]);
  public state = input<CRUD_STATE>(CRUD_STATE.VIEW);
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
    showCurrentPageReport: true,
    exportFilename: '',
  });

  public new = output<void>();
  public deleteMultiple = output<string[]>();
  public export = output<boolean>();
  public globalFilter = output<string>();
  public selectAction = output<ICrudTableAction>();
  public closeForm = output<boolean>();

  public readonly CRUD_COLUMN_ALIGNMENT = CRUD_COLUMN_ALIGNMENT;
  public readonly CRUD_COLUMN_TYPE = CRUD_COLUMN_TYPE;
  public readonly DATES = DATES;
  public selectedMultipleData: any[] = [];

  public jsonEditorDialogConfig: IJsonEditorDialogComponent;
  public jsonEditorValue: any;

  public formDialogConfig: IDialogComponent = {
    closeOnSubmit: false,
    header: {
      closable: true,
      title: 'New element',
      subTitle: ''
    },
    footer: {
      cancelButton: {
        show: true,
        label: 'Close',
        severity: BUTTON_SEVERITY.SECONDARY,
        outlined: true,
        text: false,
        rounded: false,
        disabled: undefined
      },
      submitButton: {
        show: true,
        label: 'Save',
        severity: BUTTON_SEVERITY.PRIMARY,
        outlined: true,
        text: false,
        rounded: false,
        disabled: undefined
      }
    }
  };

  public get tableActionsEnabled(): boolean {
    return this.config()?.tableActions?.length > MAGIC_NUMBERS.N_0;
  }

  public get exportFilename(): string {
    const name: string = this.config()?.exportFilename ?? 'csv';
    const date: string = new Date().toISOString();
    return `${name}_${this.datesService.formatDate(DATES.ISO_DATE, date)}.csv`;
  }

  public get showForm(): boolean {
    return this.state() === CRUD_STATE.NEW || this.state() === CRUD_STATE.EDIT;
  }

  private literals: ITranslateLiterals;

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private datesService = inject(DatesService);

  constructor() {
    effect(() => {
      this.state;
      if (this.state() === CRUD_STATE.NEW) {
        this.formDialogConfig.header.title = this.literals?.['FORM_NEW'];
        this.formDialogConfig.footer.submitButton.label = this.literals?.['FORM_SAVE'];
      } else if (this.state() === CRUD_STATE.EDIT) {
        this.formDialogConfig.header.title = this.literals?.['FORM_EDIT'];
        this.formDialogConfig.footer.submitButton.label = this.literals?.['FORM_UPDATE'];
      }
    })
  }

  ngOnInit(): void {
    this.translateService.stream('CRUD')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.formDialogConfig.header.title = this.literals?.['FORM_NEW'];
        this.formDialogConfig.footer.submitButton.label = this.literals?.['FORM_SAVE'];
        this.formDialogConfig.footer.cancelButton.label = this.literals?.['FORM_CLOSE'];
      });
  }

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
        height: MAGIC_NUMBERS.N_600,
        heightUnit: JSON_EDITOR_HEIGHT_UNIT.PIXELS,
        type: col.type as unknown as JSON_EDITOR_TYPE,
        mode: JSON_EDITOR_MODE.VIEW,
        inputId: `crud-json-editor-${col.field}-${value[this.config().dataKey ?? '_id']}`
      }
    };

    this.jsonEditorValue = value[col.field] 
      ? value[col.field]
      : col.type === CRUD_COLUMN_TYPE.OBJECT ? {} : [];
  }
}