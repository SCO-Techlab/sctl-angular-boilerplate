import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ContentChildren, DestroyRef, effect, inject, input, OnInit, output, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogComponent, LoaderComponent } from '@core/components';
import { JsonEditorDialogComponent, OrderListDialogComponent } from '@core/dialogs';
import { CRUD_ACTIONS, DATES, MAGIC_NUMBERS } from '@core/shared/constants';
import { CrudTemplateDirective } from '@core/shared/directives';
import {
  BUTTON_SEVERITY,
  CRUD_COLUMN_ALIGNMENT,
  CRUD_COLUMN_TYPE,
  CRUD_STATE,
  JSON_EDITOR_HEIGHT_UNIT,
  JSON_EDITOR_MODE,
  JSON_EDITOR_TYPE
} from '@core/shared/enums';
import {
  ICrudColumn,
  ICrudComponent,
  ICrudPaginationEvent,
  ICrudTableAction,
  IDialogComponent,
  IJsonEditorDialogComponent,
  IOrderListDialogComponent,
  ITranslateLiterals
} from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { DatesService, ScreenService, TranslateService } from '@core/shared/services';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

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
    MessageModule,
    TooltipModule,
    JsonEditorDialogComponent,
    DialogComponent,
    OrderListDialogComponent,
    LoaderComponent
  ]
})
export class CrudComponent implements OnInit, AfterViewInit {

  @ViewChild('dt') dt!: Table;
  @ContentChildren(CrudTemplateDirective) templates!: QueryList<CrudTemplateDirective>;

  public showTable = input<boolean>(true);
  public data = input<any[]>([]);
  public state = input<CRUD_STATE>(CRUD_STATE.VIEW);
  public config = input<ICrudComponent>({
    toolbarEnabled: true,
    filtersEnabled: false,
    onlyTable: false,
    tableActions: [],
    newValueButtonEnabled: true,
    multipleDeleteButtonEnabled: true,
    exportButtonEnabled: true,
    searchInputEnabled: true,
    cols: [],
    globalFilterFields: [],
    dataKey: '_id',
    titleKeys: [],
    rowHover: true,
    paginator: true,
    showCurrentPageReport: true,
    pagination: {
      ajaxPagination: false,
      rowsPerPageOptions: [MAGIC_NUMBERS.N_5, MAGIC_NUMBERS.N_10, MAGIC_NUMBERS.N_20, MAGIC_NUMBERS.N_30],
      rows: MAGIC_NUMBERS.N_5,
      totalRecords: null,
      first: null
    },
    disableSubmitButton: () => { return false; },
    literals: {
      NEW: null,
      DELETE: null,
      EXPORT: null,
      PAGE_REPORT: null,
      TITLE: null,
      SEARCH: null,
      BOOLEAN_TRUE: null,
      BOOLEAN_FALSE: null,
      JSON_EDITOR_CLOSE: null,
      FORM_NEW: null,
      FORM_EDIT: null,
      FORM_CLOSE: null,
      FORM_SAVE: null,
      FORM_UPDATE: null,
      ORDER_LIST_CLOSE: null,
      CLEAR_FILTERS: null,
      SEARCH_FILTERS: null,
      HIDE_FILTERS: null,
      SHOW_FILTERS: null
    },
    disabledButtons: {
      [CRUD_ACTIONS.NEW]: () => { return false; },
      [CRUD_ACTIONS.DELETE_MULTIPLE]: () => { return false; },
      [CRUD_ACTIONS.EXPORT]: () => { return false; },
      [CRUD_ACTIONS.GLOBAL_FILTER]: () => { return false; },
      [CRUD_ACTIONS.EDIT]: () => { return false; },
      [CRUD_ACTIONS.DELETE]: () => { return false; },
      [CRUD_ACTIONS.CLEAR_FILTERS]: () => { return false; },
      [CRUD_ACTIONS.SEARCH_FILTERS]: () => { return false; }
    }
  });

  public new = output<void>();
  public deleteMultiple = output<string[]>();
  public export = output<void>();
  public globalFilter = output<string>();
  public selectAction = output<ICrudTableAction>();
  public closeForm = output<boolean>();
  public pagination = output<ICrudPaginationEvent>();
  public clearFilters = output<void>();
  public searchFilters = output<void>();

  public readonly CRUD_COLUMN_ALIGNMENT = CRUD_COLUMN_ALIGNMENT;
  public readonly CRUD_COLUMN_TYPE = CRUD_COLUMN_TYPE;
  public readonly DATES = DATES;
  public readonly CRUD_ACTIONS = CRUD_ACTIONS;
  public selectedMultipleData: any[] = [];
  public showFilters = false;

  public jsonEditorDialogConfig: IJsonEditorDialogComponent;
  public jsonEditorValue: any;

  public orderListDialogConfig: IOrderListDialogComponent;
  public orderListValues: any[];

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

  public get showForm(): boolean {
    return this.state() === CRUD_STATE.NEW || this.state() === CRUD_STATE.EDIT;
  }

  public get totalRecords(): number {
    return this.config()?.pagination?.ajaxPagination
      ? this.config()?.pagination?.totalRecords ?? MAGIC_NUMBERS.N_0
      : this.data()?.length ?? MAGIC_NUMBERS.N_0;
  }

  public get first(): number {
    return this.config()?.pagination?.ajaxPagination
      ? this.config()?.pagination?.first ?? MAGIC_NUMBERS.N_0
      : this.paginationEvent?.first ?? MAGIC_NUMBERS.N_0;
  }

  public get lazy(): boolean {
    return this.config().pagination?.ajaxPagination ?? false;
  }

  public get rows(): number {
    return this.config()?.pagination?.rows ?? MAGIC_NUMBERS.N_5;
  }

  public get isMobile(): boolean {
    return this.screenService.isMobile;
  }

  public get isTablet(): boolean {
    return this.screenService.isTablet;
  }

  public get isDesktop(): boolean {
    return this.screenService.isDesktop;
  }

  private templateMap = new Map<string, TemplateRef<any>>();
  private literals: ITranslateLiterals;
  private selectedValue: any;
  private paginationEvent: ICrudPaginationEvent;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly datesService = inject(DatesService);
  private readonly screenService = inject(ScreenService);

  constructor() {
    effect(() => {
      this.state;
      if (this.state() === CRUD_STATE.NEW) {
        this.formDialogConfig.header.title = this.config()?.literals?.FORM_NEW ?? this.literals?.['FORM_NEW'];
        this.formDialogConfig.header.subTitle = '';
        this.formDialogConfig.footer.submitButton.label = this.config()?.literals?.FORM_SAVE ?? this.literals?.['FORM_SAVE'];
      } else if (this.state() === CRUD_STATE.EDIT) {
        this.formDialogConfig.header.title = this.config()?.literals?.FORM_EDIT ? this.config()?.literals?.FORM_EDIT : this.literals?.['FORM_EDIT'];
        this.formDialogConfig.header.subTitle = this.getModalTitle(this.selectedValue);
        this.formDialogConfig.footer.submitButton.label = this.config()?.literals?.FORM_UPDATE ?? this.literals?.['FORM_UPDATE'];
      }
    });
  }

  ngOnInit(): void {
    this.formDialogConfig.footer.submitButton.disabled = this.config()?.disableSubmitButton ?? (() => { return false; })
    this.translateService.stream('CRUD')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.formDialogConfig.header.title = this.config()?.literals?.FORM_NEW ?? this.literals?.['FORM_NEW'];
        this.formDialogConfig.footer.submitButton.label = this.config()?.literals?.FORM_SAVE ?? this.literals?.['FORM_SAVE'];
        this.formDialogConfig.footer.cancelButton.label = this.config()?.literals?.FORM_CLOSE ?? this.literals?.['FORM_CLOSE'];
      });
  }

  ngAfterViewInit(): void {
    this.templates?.forEach((template: CrudTemplateDirective) => {
      this.templateMap.set(template.name, template.template);
    });
  }

  public onNew(): void {
    this.selectedValue = undefined;
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
    this.export.emit();
  }

  public onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.globalFilter.emit((event.target as HTMLInputElement).value);
  }

  public onSelectAction(action: ICrudTableAction, value: any): void {
    this.selectedValue = value;
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
          title: col.header,
          subTitle: this.getModalTitle(value)
        },
        footer: {
          cancelButton: {
            show: true,
            label: this.config()?.literals?.JSON_EDITOR_CLOSE ?? this.literals?.['JSON_EDITOR_CLOSE'],
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

  public openOrderListDialog(value: any, col: ICrudColumn): void {
    this.orderListDialogConfig = {
      dialogConfig: {
        closeOnSubmit: false,
        header: {
          closable: true,
          title: col.header,
          subTitle: this.getModalTitle(value)
        },
        footer: {
          cancelButton: {
            show: true,
            label: this.config()?.literals?.ORDER_LIST_CLOSE ?? this.literals?.['ORDER_LIST_CLOSE'],
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
      dataKey: col.options?.array?.dataKey ?? null,
      titleKeys: col.options?.array?.titleKeys ?? [],
      notResponsive: true,
      readonly: true
    };

    this.orderListValues = value[col.field]?.length ? value[col.field] : [];
  }

  public isButtonDisabled(action: string): boolean {
    const actions: string[] = Object.values(CRUD_ACTIONS);
    if (!actions?.length) {
      return false;
    }

    const existAction: string = actions.find(a => a === action);
    if (!existAction) {
      return false;
    }

    return this.config()?.disabledButtons?.[existAction]
      ? this.config()?.disabledButtons?.[existAction]()
      : false;
  }

  public getTemplate(field: string): TemplateRef<any> | null {
    return this.templateMap.get(field) ?? null;
  }

  public onPageChange($event: any): void {
    const page = ($event.first / $event.rows) + MAGIC_NUMBERS.N_1;
    this.paginationEvent = { first: $event.first, limit: $event.rows, page };
    this.pagination.emit(this.paginationEvent);
  }

  public onClearFilters(): void {
    this.clearFilters.emit();
  }

  public onSearchFilters(): void {
    this.searchFilters.emit();
  }

  private getModalTitle(value: any): string {
    if (!this.config()?.titleKeys?.length) {
      return value[this.config().dataKey ?? '_id'];
    }

    return this.config()?.titleKeys.map(key => value[key]).join(' - ');
  }
}