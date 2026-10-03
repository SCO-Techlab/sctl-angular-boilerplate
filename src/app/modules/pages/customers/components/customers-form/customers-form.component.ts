import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '@core/components';
import { MAGIC_NUMBERS } from '@core/shared';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { DatesService, TranslateService } from '@core/shared/services';
import { REGEX } from '@shared/constants';
import { ICustomer, ICustomerGuardian } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'sctl-customers-form',
  standalone: true,
  templateUrl: './customers-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    ButtonModule,
    InputErrorComponent,
    DatePickerModule,
  ]
})
export class CustomersFormComponent implements OnInit {

  public value = input<ICustomer>();

  public valueChange = output<ICustomer>();
  public formValid = output<boolean>();
  public customerForm: FormGroup;
  public formErrors: { [key: string]: IInputErrorComponent } = {};
  public hasPrimaryGuardian = false;
  public hasSecondaryGuardian = false;
  public readonly maxBirthDate = this.getMaxBirthDate();

  private literals: ITranslateLiterals;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly datesService = inject(DatesService);

  ngOnInit(): void {
    this.initForm();
    this.fillForm(this.value());

    this.translateService.stream('CUSTOMERS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  private initForm(): void {
    this.customerForm = new FormGroup({
      name: new FormControl<string>('', [Validators.required]),
      email: new FormControl<string>('', [Validators.required, Validators.pattern(REGEX.EMAIL)]),
      phone: new FormControl<string>('', [Validators.required]),
      dni: new FormControl<string>('', [Validators.required]),
      birthDate: new FormControl<Date | null>(null, [Validators.required]),
      primaryGuardian: this.createGuardianForm(),
      secondaryGuardian: this.createGuardianForm()
    });

    this.customerForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        this.formValid.emit(this.customerForm.valid);
        if (!this.customerForm.valid) {
          return;
        }

        this.emitCustomerValue();
      });

    this.customerForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.formValid.emit(this.customerForm.valid));
  }

  private fillForm(value: ICustomer): void {
    this.customerForm.patchValue({
      name: value?.name ?? '',
      email: value?.email ?? '',
      phone: value?.phone ?? '',
      dni: value?.dni ?? '',
      birthDate: value?.birthDate ? new Date(`${value.birthDate.slice(0, 10)}T00:00:00`) : null,
      primaryGuardian: this.guardianToFormValue(value?.primaryGuardian),
      secondaryGuardian: this.guardianToFormValue(value?.secondaryGuardian)
    }, { emitEvent: false });
    this.hasPrimaryGuardian = Boolean(value?.primaryGuardian);
    this.hasSecondaryGuardian = Boolean(value?.secondaryGuardian);
    this.setGuardianValidators(this.customerForm.get('primaryGuardian') as FormGroup, this.hasPrimaryGuardian);
    this.setGuardianValidators(this.customerForm.get('secondaryGuardian') as FormGroup, this.hasSecondaryGuardian);
  }

  private setFormErrors(): void {
    this.formErrors = {
      name: {
        formControl: this.customerForm?.get?.('name'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['NAME'] }
        ]
      },
      email: {
        formControl: this.customerForm?.get?.('email'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['EMAIL'] },
          { error: INPUT_ERROR.PATTERN, message: this.literals?.['ERRORS']?.['EMAIL_INVALID'] }
        ]
      },
      phone: {
        formControl: this.customerForm?.get?.('phone'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['PHONE'] }
        ]
      },
      dni: {
        formControl: this.customerForm?.get?.('dni'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['DNI'] }
        ]
      },
      birthDate: {
        formControl: this.customerForm?.get?.('birthDate'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['BIRTHDAY'] }
        ]
      }
    };

    this.setGuardianFormErrors('primaryGuardian');
    this.setGuardianFormErrors('secondaryGuardian');
  }

  public addPrimaryGuardian(): void {
    if (this.hasPrimaryGuardian) {
      return;
    }

    this.hasPrimaryGuardian = true;
    this.setGuardianValidators(this.customerForm.get('primaryGuardian') as FormGroup, true);
    this.updateFormValidity();
  }

  public removePrimaryGuardian(): void {
    this.removeGuardian('primaryGuardian');
  }

  public addSecondaryGuardian(): void {
    if (this.hasSecondaryGuardian) {
      return;
    }

    this.hasSecondaryGuardian = true;
    this.setGuardianValidators(this.customerForm.get('secondaryGuardian') as FormGroup, true);
    this.updateFormValidity();
  }

  public removeSecondaryGuardian(): void {
    this.removeGuardian('secondaryGuardian');
  }

  private createGuardianForm(): FormGroup {
    return new FormGroup({
      name: new FormControl<string>('', []),
      email: new FormControl<string>('', []),
      phone: new FormControl<string>('', []),
      dni: new FormControl<string>('', []),
      birthDate: new FormControl<Date | null>(null, [])
    });
  }

  private emptyGuardian(): ICustomerGuardian {
    return { name: '', email: '', phone: '', dni: '', birthDate: '' };
  }

  private guardianToFormValue(value?: ICustomerGuardian): Record<string, unknown> {
    return {
      ...this.emptyGuardian(),
      ...value,
      birthDate: value?.birthDate ? new Date(`${value.birthDate.slice(0, 10)}T00:00:00`) : null
    };
  }

  private setGuardianValidators(guardian: FormGroup, required: boolean): void {
    const controls = guardian.controls;
    controls['name'].setValidators(required ? [Validators.required] : []);
    controls['email'].setValidators(required ? [Validators.required, Validators.pattern(REGEX.EMAIL)] : []);
    controls['phone'].setValidators(required ? [Validators.required] : []);
    controls['dni'].setValidators(required ? [Validators.required] : []);
    controls['birthDate'].setValidators(required ? [Validators.required] : []);
    Object.values(controls).forEach(control => control.updateValueAndValidity({ onlySelf: true, emitEvent: false }));
    guardian.updateValueAndValidity({ emitEvent: false });
  }

  private updateFormValidity(): void {
    this.customerForm.updateValueAndValidity({ emitEvent: false });
    this.formValid.emit(this.customerForm.valid);
  }

  private emitCustomerValue(): void {
    const value = this.customerForm.getRawValue();
    this.valueChange.emit({
      name: value.name,
      email: value.email,
      phone: value.phone,
      dni: value.dni,
      birthDate: value.birthDate ? this.datesService.formatDate('yyyy-MM-dd', value.birthDate) : '',
      primaryGuardian: this.hasPrimaryGuardian ? this.formatGuardian(value.primaryGuardian) : undefined,
      secondaryGuardian: this.hasSecondaryGuardian ? this.formatGuardian(value.secondaryGuardian) : undefined
    } as ICustomer);
  }

  private formatGuardian(value: ICustomerGuardian): ICustomerGuardian {
    return {
      ...value,
      birthDate: value?.birthDate ? this.datesService.formatDate('yyyy-MM-dd', value.birthDate) : ''
    };
  }

  private removeGuardian(guardianName: 'primaryGuardian' | 'secondaryGuardian'): void {
    const hasGuardian = guardianName === 'primaryGuardian' ? this.hasPrimaryGuardian : this.hasSecondaryGuardian;
    if (!hasGuardian) {
      return;
    }

    if (guardianName === 'primaryGuardian') {
      this.hasPrimaryGuardian = false;
    } else {
      this.hasSecondaryGuardian = false;
    }

    const guardian = this.customerForm.get(guardianName) as FormGroup;
    guardian.reset({ ...this.emptyGuardian(), birthDate: null }, { emitEvent: false });
    this.setGuardianValidators(guardian, false);
    this.updateFormValidity();
    if (this.customerForm.valid) {
      this.emitCustomerValue();
    }
  }

  private setGuardianFormErrors(guardianName: 'primaryGuardian' | 'secondaryGuardian'): void {
    const name = this.customerForm.get(`${guardianName}.name`);
    const email = this.customerForm.get(`${guardianName}.email`);
    const phone = this.customerForm.get(`${guardianName}.phone`);
    const dni = this.customerForm.get(`${guardianName}.dni`);

    this.formErrors[`${guardianName}.name`] = {
      formControl: name,
      cssClass: 'mb-0',
      errorsToShow: [
        { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['NAME'] }
      ]
    };
    this.formErrors[`${guardianName}.email`] = {
      formControl: email,
      cssClass: 'mb-0',
      errorsToShow: [
        { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['EMAIL'] },
        { error: INPUT_ERROR.PATTERN, message: this.literals?.['ERRORS']?.['EMAIL_INVALID'] }
      ]
    };
    this.formErrors[`${guardianName}.phone`] = {
      formControl: phone,
      cssClass: 'mb-0',
      errorsToShow: [
        { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['PHONE'] }
      ]
    };
    this.formErrors[`${guardianName}.dni`] = {
      formControl: dni,
      cssClass: 'mb-0',
      errorsToShow: [
        { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['DNI'] }
      ]
    };
    this.formErrors[`${guardianName}.birthDate`] = {
      formControl: this.customerForm.get(`${guardianName}.birthDate`),
      cssClass: 'mb-0',
      errorsToShow: [
        { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['BIRTHDAY'] }
      ]
    };
  }

  private getMaxBirthDate(): Date {
    const maxDate = new Date();
    maxDate.setHours(MAGIC_NUMBERS.N_0, MAGIC_NUMBERS.N_0, MAGIC_NUMBERS.N_0, MAGIC_NUMBERS.N_0);
    maxDate.setDate(maxDate.getDate() - MAGIC_NUMBERS.N_1);
    return maxDate;
  }
}
