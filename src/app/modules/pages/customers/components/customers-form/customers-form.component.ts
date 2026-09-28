import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '@core/components';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { REGEX } from '@shared/constants';
import { ICustomer } from '@shared/interfaces';
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
    InputErrorComponent,
  ]
})
export class CustomersFormComponent implements OnInit {

  public value = input<ICustomer>();

  public valueChange = output<ICustomer>();
  public formValid = output<boolean>();
  public customerForm: FormGroup;
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;
  private firstChange: boolean;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.firstChange = true;

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
      email: new FormControl<string>('', [Validators.pattern(REGEX.EMAIL)]),
      phone: new FormControl<string>(''),
      dni: new FormControl<string>(''),
    });

    this.customerForm.valueChanges.subscribe((value: ICustomer) => {
      if (this.firstChange) {
        this.firstChange = false;
        return;
      }

      if (!this.customerForm.valid) {
        return;
      }

      this.valueChange.emit(value);
    });

    this.customerForm.statusChanges.subscribe((status: string) => {
      this.formValid.emit(status === 'VALID');
    });
  }

  private fillForm(value: ICustomer): void {
    this.customerForm.setValue({
      name: value?.name ?? '',
      email: value?.email ?? '',
      phone: value?.phone ?? '',
      dni: value?.dni ?? ''
    });
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
          { error: INPUT_ERROR.PATTERN, message: this.literals?.['ERRORS']?.['EMAIL_INVALID'] }
        ]
      }
    };
  }
}
