import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { DATES, MAGIC_NUMBERS } from '../../constants';
import { CRUD_COLUMN_TYPE, CRUD_INPUT_TYPE } from '../../enums';
import { ICrudAction, ICrudActionEvent, ICrudButtonsEnabled, ICrudColumn, ICrudFormInput, ICrudInputError, ICrudLiterals, ICrudSaveEvent } from '../../interfaces';
import { ScreenService } from '../../services';

@Component({
  selector: 'sctl-crud',
  standalone: true,
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    ToggleSwitchModule,
    PasswordModule,
    DatePickerModule,
    MessageModule
  ],
  providers: [
    DatePipe
  ]
})
export class CrudComponent implements OnInit {

  @Input() dataKey: string = '_id';
  @Input() valueKey: string = '_id';
  @Input() values: any[] = [];
  @Input() value: any;
  @Input() cols: ICrudColumn[] = [];
  @Input() inputs: ICrudFormInput[] = [];
  @Input() buttonsEnabled: ICrudButtonsEnabled = { EXPORT: false, NEW: false, DELETE: false, SEARCH: false, EDIT_ACTION: false, DELETE_ACTION: false };
  @Input() extraActions: ICrudAction[] = [];
  @Input() exportFilename: string = 'crud-component';
  @Input() rowsPerPageOptions: number[] = [MAGIC_NUMBERS.N_5, MAGIC_NUMBERS.N_10, MAGIC_NUMBERS.N_20, MAGIC_NUMBERS.N_30];
  @Input() paginator: boolean = true;
  @Input() showCurrentPageReport: boolean = true;
  @Input() rowHover: boolean = true;
  @Input() globalFilterFields: string[] = [];
  @Input() formValidationFn: Function;
  @Input() literals: ICrudLiterals = {
    TITLE: 'Manage Values',
    FORM_TITLE: 'Add value',
    FORM_TITLE_EDIT: 'Edit value',
    DELETE_TITLE: 'Delete value',
    DELETE_MESSAGE: 'Are you sure you want to delete the value',
    DELETE_MULTIPLE_TITLE: 'Delete values',
    DELETE_MULTIPLE_MESSAGE: 'Are you sure you want to delete the selected values?',
    SAVE: 'Save',
    EDIT: 'Edit',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    SEARCH: 'Search',
    NEW: 'New',
    EXPORT: 'Export',
    YES: 'Yes',
    NO: 'No',
    PAGINATOR_REPORT: 'Showing {first} to {last} of {totalRecords} values'
  }

  @Output() export: EventEmitter<void> = new EventEmitter();
  @Output() save: EventEmitter<ICrudSaveEvent> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() deleteMultiple: EventEmitter<any[]> = new EventEmitter();
  @Output() action: EventEmitter<ICrudActionEvent> = new EventEmitter();

  public selectedValues: any[] = [];
  public formDialog: boolean = false;
  public deleteDialog: boolean = false;
  public deleteMultipleDialog: boolean = false;
  public isEdit: boolean = false;
  public editTitle: string;
  public readonly CRUD_COLUMN_TYPE = CRUD_COLUMN_TYPE;
  public readonly CRUD_INPUT_TYPE = CRUD_INPUT_TYPE;
  public formErrors: ICrudInputError = {};

  constructor(
    private screenService: ScreenService,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef
  ) { }

  public get modalWidth(): string {
    if (this.screenService.XS) {
      return '375px';
    }

    return '450px';
  }

  public get formIsValid(): boolean {
    return Object.values(this.formErrors).length === MAGIC_NUMBERS.N_0;
  }

  ngOnInit() {
    this.exportFilename = `${this.exportFilename}_${this.datePipe.transform(new Date(), DATES.ISO_DATE)}`;
  }

  onGlobalFilter(table: Table, event: Event) {
    if (this.buttonsEnabled.SEARCH) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
  }

  openMultipleDeleteDialog() {
    this.deleteMultipleDialog = true;
  }

  confirmMultipleDelete() {
    const values: any[] = structuredClone(this.selectedValues);
    this.deleteMultiple.emit(values);
    this.selectedValues = [];
    this.deleteMultipleDialog = false;
  }

  openNewDialog() {
    this.value = {};

    for (const input of this.inputs) {
      if (input.default !== undefined) {
        this.value[input.field] = input.default;
      } else {
        this.value[input.field] = undefined;
      }
    }

    this.isEdit = false;
    this.formDialog = true;
    if (this.formValidationFn) {
      this.formErrors = this.formValidationFn(this.value, this.isEdit);
    }
    this.cdRef.detectChanges();
  }

  openEditDialog(value: any) {
    this.value = structuredClone(value);

    for (const input of this.inputs) {
      if (input.default !== undefined && this.value[input.field] === undefined) {
        this.value[input.field] = input.default;
      }
    }

    this.isEdit = true;
    this.editTitle = this.value?.[this.valueKey];
    this.formDialog = true;
    if (this.formValidationFn) {
      this.formErrors = this.formValidationFn(this.value, this.isEdit);
    }
    this.cdRef.detectChanges();
  }

  cancelFormDialog() {
    this.formErrors = {};
    this.cdRef.detectChanges();
    this.formDialog = false;
  }

  confirmFormDialog() {
    if (!this.formIsValid) return;
    this.save.emit({ value: this.value, isEdit: this.isEdit });
    this.formDialog = false;
  }

  openDeleteDialog(value: any) {
    this.value = structuredClone(value);
    this.deleteDialog = true;
  }

  confirmDelete() {
    this.delete.emit(this.value);
    this.deleteDialog = false;
  }

  selectAction(action: ICrudAction, value: any) {
    this.action.emit({ action, value });
  }

  showValue(value: any, col: ICrudColumn): any {
    if (col.type === CRUD_COLUMN_TYPE.BOOLEAN) {
      return value[col.field] === true ? this.literals.YES : this.literals.NO;
    }

    if (col.type === CRUD_COLUMN_TYPE.DATE) {
      const format: string = col?.options?.date?.format || DATES.ISO_DATETIME;
      return this.datePipe.transform(value[col.field], format);
    }

    return value[col.field];
  }

  onChangeValue(): void {
    if (!this.formValidationFn) {
      this.formErrors = {};
      return;
    }

    this.formErrors = this.formValidationFn(this.value, this.isEdit);
  }

  showInput(input: ICrudFormInput): boolean {
    if (this.isEdit)
      return input.hideOnEdit === true ? false : true;
    return input.hideOnCreate === true ? false : true;
  }

  getAvatarUrl(value: any, col: ICrudColumn): string {
    return value && value[col.field]
      ? value[col.field]
      : col.options?.[CRUD_COLUMN_TYPE.AVATAR]?.avatarUrl ?? 'assets/img/user-avatar.png';
  }
}
