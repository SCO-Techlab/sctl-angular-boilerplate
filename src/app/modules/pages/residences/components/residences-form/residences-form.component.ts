import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImagesGalleriaComponent, InputErrorComponent } from '@core/components';
import { FILE_SIZES, MAGIC_NUMBERS } from '@core/shared';
import { CRUD_STATE, INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { SpinnerService, ToastService, TranslateService } from '@core/shared/services';
import { environment } from '@environment';
import { IImagesGalleriaComponent } from '@shared/interfaces';
import { SelectTenantService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { finalize } from 'rxjs';
import { IResidence } from '../../interfaces';
import { ResidencesService } from '../../services';

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
    ImagesGalleriaComponent,
  ]
})
export class ResidencesFormComponent implements OnInit {

  public value = input<IResidence>();
  public crudState = input<CRUD_STATE>(CRUD_STATE.NEW);

  public valueChange = output<{ value: IResidence, imagesChanged: boolean }>();
  public formValid = output<boolean>();
  public residenceForm: FormGroup;
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  public isEditMode: boolean;
  public imagesGalleriaConfig: IImagesGalleriaComponent;
  public imagesSrc: string;

  private literals: ITranslateLiterals;
  private firstChange: boolean;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly toastService = inject(ToastService);
  private readonly residenceService = inject(ResidencesService);
  private readonly selectTenantService = inject(SelectTenantService);

  ngOnInit(): void {
    this.firstChange = true;
    this.isEditMode = this.crudState() === CRUD_STATE.EDIT;
    this.setImagesGalleriaConfig();

    this.initForm();
    this.fillForm(this.value());

    this.translateService.stream('RESIDENCES')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  public onUploadImages(files: File[]): void {
    if (this.residenceService.validateMaxImagesPerResidence(files)) {
      this.toastService.error({
        summary: this.translateService.instant('TOAST.ERROR'),
        detail: this.literals?.['IMAGES']['MAX_IMAGES_ALLOWED']
      });
      return;
    }

    if (this.residenceService.validateMaxImageSize(files)) {
      this.toastService.error({
        summary: this.translateService.instant('TOAST.ERROR'),
        detail: this.literals?.['IMAGES']['MAX_IMAGE_SIZE']
      });
      return;
    }

    this.spinnerService.show();
    this.residenceService.addResidenceImages(this.value()?._id, files)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (residence: IResidence) => {
          if (!residence) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['IMAGES']['UPDATE_KO']
            });
            return;
          }

          this.valueChange.emit({ value: residence, imagesChanged: true });
          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['IMAGES']['UPDATE_OK']
          });
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['IMAGES']['UPDATE_KO'],
          })
        }
      })
  }

  public onDeleteImage(imageIndex: number): void {
    const imageId = this.value()?.images?.[imageIndex] ?? '';
    this.spinnerService.show();
    this.residenceService.deleteResidenceImage(this.value()?._id, imageId)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (residence: IResidence) => {
          if (!residence) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['IMAGES']?.['DELETE_KO']
            });
            return;
          }

          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['IMAGES']?.['DELETE_OK']
          });
          this.valueChange.emit({ value: residence, imagesChanged: true });
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['IMAGES']?.['DELETE_KO']
          });
        }
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

      this.valueChange.emit({ value, imagesChanged: false });
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

  private setImagesGalleriaConfig(): void {
    this.imagesGalleriaConfig = {
      showLabel: true,
      showAddImageButton: true,
      showDeleteImageButton: true,
      showImageTitleIndex: true,
      maxFileSizeMb: FILE_SIZES.MB_5,
      maxFiles: MAGIC_NUMBERS.N_5,
    };

    this.imagesSrc = `${environment.apiUrl}/residences/get/image/${this.value()?._id}/{imageId}/${this.selectTenantService.selectedTenant}`;
  }
}
