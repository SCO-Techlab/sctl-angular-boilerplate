import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '@core/components';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { IResidence } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'sctl-residences-form',
  standalone: true,
  templateUrl: './residences-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    TextareaModule,
    GalleriaModule,
    ButtonModule,
    InputErrorComponent,
  ]
})
export class ResidencesFormComponent implements OnInit {

  public value = input<IResidence>();

  public valueChange = output<IResidence>();
  public formValid = output<boolean>();
  public residenceForm: FormGroup;
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;
  private firstChange: boolean;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.firstChange = true;

    this.initForm();
    this.fillForm(this.value());

    this.translateService.stream('RESIDENCES')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  private initForm(): void {
    this.residenceForm = new FormGroup({
      street: new FormControl<string>('', [Validators.required]),
      number: new FormControl<string>('', [Validators.required]),
      flat: new FormControl<string>(''),
      door: new FormControl<string>(''),
      city: new FormControl<string>('', [Validators.required]),
      province: new FormControl<string>('', [Validators.required]),
      postalCode: new FormControl<string>('', [Validators.required]),
      cadastre: new FormControl<string>(''),
      description: new FormControl<string>(''),
    });

    this.residenceForm.valueChanges.subscribe((value: IResidence) => {
      if (this.firstChange) {
        this.firstChange = false;
        return;
      }

      if (!this.residenceForm.valid) {
        return;
      }

      this.valueChange.emit(value);
    });

    this.residenceForm.statusChanges.subscribe((status: string) => {
      this.formValid.emit(status === 'VALID' ? true : false);
    });
  }

  private fillForm(value: IResidence): void {
    this.residenceForm.setValue({
      street: value?.street ?? '',
      number: value?.number ?? '',
      flat: value?.flat ?? '',
      door: value?.door ?? '',
      city: value?.city ?? '',
      province: value?.province ?? '',
      postalCode: value?.postalCode ?? '',
      cadastre: value?.cadastre ?? '',
      description: value?.description ?? ''
    });
  }

  private setFormErrors(): void {
    this.formErrors = {
      street: {
        formControl: this.residenceForm?.get?.('street'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['STREET'] }
        ]
      },
      number: {
        formControl: this.residenceForm?.get?.('number'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['NUMBER'] }
        ]
      },
      city: {
        formControl: this.residenceForm?.get?.('city'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['CITY'] }
        ]
      },
      province: {
        formControl: this.residenceForm?.get?.('province'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['PROVINCE'] }
        ]
      },
      postalCode: {
        formControl: this.residenceForm?.get?.('postalCode'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['POSTAL_CODE'] }
        ]
      }
    }
  }
}
