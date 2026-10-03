import { Component, DestroyRef, effect, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogComponent } from '@core/components';
import { BUTTON_SEVERITY, IDialogComponent, ITranslateLiterals, TranslateModule, TranslateService } from '@core/shared';
import { RESIDENCES_CALENDAR_TYPE } from '@shared/enums';
import { IResidenceCalendar } from '@shared/interfaces';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'sctl-residence-calendar-dialog',
  standalone: true,
  templateUrl: './residence-calendar-dialog.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DialogComponent,
    SelectModule,
    ToggleSwitchModule
  ]
})
export class ResidenceCalendarDialogComponent implements OnInit {

  public visible = input<boolean>(false);
  public value = input<IResidenceCalendar>(null);
  public config = input<IDialogComponent>({
    closeOnSubmit: false,
    fullScreen: false,
    header: {
      closable: true,
      title: 'Residence Calendar Dialog',
      subTitle: 'Residence Calendar Dialog sub title'
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

  public submit = output<IResidenceCalendar>();
  public close = output<void>();

  public showDialog: boolean = false;
  public form: FormGroup;
  public typeOptions: { label: string, value: string }[] = [];

  private literals: ITranslateLiterals;

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);

  constructor() {
    effect(() => {
      this.visible;
      this.showDialog = this.visible();
    })
  }

  ngOnInit(): void {
    this.translateService.stream('RESIDENCES.CALENDAR_TYPE_OPTIONS')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (literals: ITranslateLiterals) => {
          this.literals = literals;
          this.initForm();
          this.fillForm(this.value());
          this.setTypeOptions();
          this.showDialog = this.visible();
        }
      });
  }

  public onClose(): void {
    this.showDialog = false;
    this.close.emit();
  }

  public onSubmit(closeOnSubmit: boolean): void {
    if (closeOnSubmit) {
      this.showDialog = false;
    }

    const value = {
      ...this.value(),
      calendarType: this.form.get('calendarType')?.value,
      weekNumber: this.form.get('weekNumber')?.value,
      showWeekends: this.form.get('showWeekends')?.value
    }

    this.submit.emit(value);
  }

  private initForm(): void {
    this.form = new FormGroup({
      calendarType: new FormControl(this.value()?.calendarType || ''),
      weekNumber: new FormControl(this.value()?.weekNumber || false),
      showWeekends: new FormControl(this.value()?.showWeekends || false)
    });
  }

  private fillForm(value: IResidenceCalendar): void {
    this.form.patchValue({
      calendarType: value?.calendarType || '',
      weekNumber: value?.weekNumber || false,
      showWeekends: value?.showWeekends || false
    });
  }

  private setTypeOptions(): void {
    const values: string[] = Object.values(RESIDENCES_CALENDAR_TYPE);

    const labels = {
      [RESIDENCES_CALENDAR_TYPE.DAY_GRID_MONTH]: this.literals?.['MONTHLY'],
      [RESIDENCES_CALENDAR_TYPE.TIME_GRID_WEEK]: this.literals?.['WEEKLY'],
      [RESIDENCES_CALENDAR_TYPE.TIME_GRID_DAY]: this.literals?.['DAILY'],
      [RESIDENCES_CALENDAR_TYPE.LIST_WEEK]: this.literals?.['LIST'],
      [RESIDENCES_CALENDAR_TYPE.MULTI_MONTH]: this.literals?.['MULTI_MONTH']
    }

    this.typeOptions = values.map(value => ({ label: labels[value], value }));
  }
}
