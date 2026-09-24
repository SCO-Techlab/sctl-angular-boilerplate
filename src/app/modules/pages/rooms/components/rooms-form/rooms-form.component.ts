import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '@core/components';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { ResidencesService } from '@modules/pages/residences/services';
import { IResidence, IRoom } from '@shared/interfaces';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'sctl-rooms-form',
  standalone: true,
  templateUrl: './rooms-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    InputErrorComponent,
  ]
})
export class RoomsFormComponent implements OnInit {

  public value = input<IRoom>();

  public valueChange = output<IRoom>();
  public formValid = output<boolean>();
  public roomForm: FormGroup;
  public formErrors: { [key: string]: IInputErrorComponent } = {};
  public residencesOptions: { name: string; value: string }[] = [];

  private literals: ITranslateLiterals;
  private firstChange: boolean;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly residencesService = inject(ResidencesService);

  ngOnInit(): void {
    this.firstChange = true;

    this.initForm();
    this.fillForm(this.value());
    this.getResidences();

    this.translateService.stream('ROOMS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  private initForm(): void {
    this.roomForm = new FormGroup({
      residence: new FormControl<string>('', [Validators.required]),
      name: new FormControl<string>('', [Validators.required]),
      beds: new FormControl<number | null>(1, [Validators.required, Validators.min(1)]),
    });

    this.roomForm.valueChanges.subscribe((value: IRoom) => {
      if (this.firstChange) {
        this.firstChange = false;
        return;
      }

      if (!this.roomForm.valid) {
        return;
      }

      this.valueChange.emit(value);
    });

    this.roomForm.statusChanges.subscribe((status: string) => {
      this.formValid.emit(status === 'VALID');
    });
  }

  private fillForm(value: IRoom): void {
    this.roomForm.setValue({
      residence: typeof value?.residence === 'string' ? value?.residence : value?.residence?._id ?? '',
      name: value?.name ?? '',
      beds: value?.beds ?? 1,
    });
  }

  private getResidences(): void {
    this.residencesService.find(null)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IResidence[] | { data?: IResidence[] }) => {
        const values: IResidence[] = Array.isArray(res) ? res : res?.data ?? [];
        this.residencesOptions = values?.map((residence: IResidence) => ({
          name: `${residence?.street ?? ''} ${residence?.number ?? ''}${residence?.city ? ` - ${residence.city}` : ''}`.trim(),
          value: residence?._id
        })) ?? [];
      });
  }

  private setFormErrors(): void {
    this.formErrors = {
      residence: {
        formControl: this.roomForm?.get?.('residence'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['RESIDENCE'] }
        ]
      },
      name: {
        formControl: this.roomForm?.get?.('name'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['NAME'] }
        ]
      },
      beds: {
        formControl: this.roomForm?.get?.('beds'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['BEDS'] },
          { error: INPUT_ERROR.MIN, message: this.literals?.['ERRORS']?.['BEDS_MIN'] }
        ]
      }
    };
  }
}