import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogComponent } from '@core/components';
import { BUTTON_SEVERITY, DatesService, IDialogComponent, TranslateModule } from '@core/shared';
import { formatResidenceAddress } from '@shared/helpers';
import { ICustomer, IRoom } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IBooking } from '../../interfaces';

@Component({
  selector: 'sctl-booking-form-dialog',
  standalone: true,
  templateUrl: './booking-form-dialog.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DialogComponent,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ButtonModule
  ]
})
export class BookingFormDialogComponent implements OnInit {

  public visible = input<boolean>(false);
  public config = input<IDialogComponent>({
    closeOnSubmit: false,
    fullScreen: false,
    header: {
      closable: true,
      title: 'Booking Form Dialog',
      subTitle: 'Booking Form Dialog sub title'
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
        show: false,
        label: 'Save',
        severity: BUTTON_SEVERITY.PRIMARY,
        outlined: true,
        text: false,
        rounded: false,
        disabled: undefined
      }
    }
  });
  public value = input<IBooking>();
  public rooms = input<IRoom[]>();
  public customers = input<ICustomer[]>();

  public submit = output<IBooking>();
  public close = output<void>();
  public delete = output<IBooking>();

  public showDialog: boolean = false;
  public form: FormGroup;
  public roomOptions: { label: string, value: IRoom }[] = [];
  public customerOptions: { label: string, value: ICustomer }[] = [];

  public get dialogConfig(): IDialogComponent {
    return {
      ...this.config(),
      footer: {
        ...this.config().footer,
        submitButton: {
          ...this.config().footer.submitButton,
          disabled: () => this.form?.invalid ?? true
        }
      }
    }
  }

  public get isEdit(): boolean {
    return this.value()?.['_id'] !== null && this.value()?.['_id'] !== undefined;
  }

  private readonly datesService = inject(DatesService);

  constructor() {
    effect(() => {
      this.visible;
      this.showDialog = this.visible();
    })
  }

  ngOnInit() {
    this.initializeOptions();
    this.initForm();
    this.fillForm(this.value());
  }

  public onClose(): void {
    this.showDialog = false;
    this.close.emit();
  }

  public onSubmit(closeOnSubmit: boolean): void {
    if (closeOnSubmit) {
      this.showDialog = false;
    }

    const value = structuredClone(this.value());
    const formValue = this.form.getRawValue();

    this.submit.emit({
      ...value,
      room: formValue.room,
      customer: formValue.customer,
      start: this.datesService.formatLocalDateTime(formValue.start),
      end: this.datesService.formatLocalDateTime(formValue.end),
    });
  }

  public onDelete(): void {
    this.showDialog = false;
    this.delete.emit(this.value());
  }

  private initializeOptions(): void {
    this.roomOptions = this.rooms()?.map(room => ({
      label: `${room.name} (${formatResidenceAddress(room.residence)})`,
      value: room
    })) || [];

    this.customerOptions = this.customers()?.map(customer => ({
      label: `${customer.name} ${customer?.email ? `(${customer.email})` : ''}`,
      value: customer
    })) || [];
  }

  private initForm(): void {
    this.form = new FormGroup({
      room: new FormControl<IRoom>(null, [Validators.required]),
      customer: new FormControl<ICustomer>(null, [Validators.required]),
      start: new FormControl<Date>(null, [Validators.required]),
      end: new FormControl<Date>(null, [Validators.required])
    });
  }

  private fillForm(value: IBooking): void {
    this.form.patchValue({
      room: value?.room ?? null,
      customer: value?.customer ?? null,
      start: value?.start ? this.datesService.parseLocalDateTime(value.start) : null,
      end: value?.end ? this.datesService.parseLocalDateTime(value.end) : null
    });
  }
}
