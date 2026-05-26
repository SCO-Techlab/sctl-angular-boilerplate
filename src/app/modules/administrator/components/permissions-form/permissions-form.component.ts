import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '@core/components';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { PERMISSION_TYPE } from '@shared/enums';
import { IPermission } from '@shared/interfaces';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'sctl-permissions-form',
  standalone: true,
  templateUrl: './permissions-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule,
    InputErrorComponent
  ]
})
export class PermissionsFormComponent implements OnInit {

  public value = input<IPermission>();

  public valueChange = output<IPermission>();
  public formValid = output<boolean>();

  public permissionForm: FormGroup;
  public typesOptions: { name: string; type: string }[] = [];
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;
  private firstChange: boolean;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.firstChange = true;
    this.getTypes();
    this.initForm();
    this.fillForm(this.value());
    this.translateService.stream('PERMISSIONS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  private getTypes(): void {
    const types: string[] = Object.values(PERMISSION_TYPE);
    this.typesOptions = types.map(type => ({ name: type, type: type }));
  }

  private initForm(): void {
    this.permissionForm = new FormGroup({
      name: new FormControl<string>('', [Validators.required]),
      type: new FormControl<string>('', [Validators.required]),
    });

    this.permissionForm.valueChanges.subscribe((value: IPermission) => {
      if (this.firstChange) {
        this.firstChange = false;
        return;
      }

      if (!this.permissionForm.valid) {
        return;
      }

      this.valueChange.emit(value);
    });

    this.permissionForm.statusChanges.subscribe((status: string) => {
      this.formValid.emit(status === 'VALID' ? true : false);
    });
  }

  private fillForm(value: IPermission): void {
    this.permissionForm.setValue({
      name: value?.name ?? '',
      type: value?.type ? { name: value.type, type: value.type } : '',
    });
  }

  private setFormErrors(): void {
    this.formErrors = {
      name: {
        formControl: this.permissionForm?.get?.('name'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['NAME'] }
        ]
      },
      type: {
        formControl: this.permissionForm?.get?.('type'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['TYPE'] }
        ]
      }
    }
  }
}
