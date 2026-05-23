import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '@core/components';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { PermissionsService } from '@modules/administrator/services';
import { IPermission, IRole } from '@shared/interfaces';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'sctl-roles-form',
  standalone: true,
  templateUrl: './roles-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    MultiSelectModule,
    InputErrorComponent
  ]
})
export class RolesFormComponent implements OnInit {

  public value = input<IRole>();

  public valueChange = output<IRole>();
  public formValid = output<boolean>();

  public rolesForm: FormGroup;
  public permissionsOptions: { name: string; _id: string }[] = [];
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;
  private firstChange: boolean;

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private permissionsService = inject(PermissionsService);

  ngOnInit(): void {
    this.firstChange = true;
    this.getPermissions();
    this.initForm();
    this.fillForm(this.value());
    this.translateService.stream('ROLES')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  private getPermissions(): void {
    this.permissionsService.find(null)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IPermission[]) => this.permissionsOptions = res?.map(permission => ({ name: `${permission.name}-${permission.type}`, _id: permission._id })) ?? []);
  }

  private initForm(): void {
    this.rolesForm = new FormGroup({
      name: new FormControl<string>('', [Validators.required]),
      permissions: new FormControl<IPermission[]>([]),
    });

    this.rolesForm.valueChanges.subscribe((value: IPermission) => {
      if (this.firstChange) {
        this.firstChange = false;
        return;
      }

      if (!this.rolesForm.valid) {
        return;
      }

      this.valueChange.emit(value);
    });

    this.rolesForm.statusChanges.subscribe((status: string) => {
      this.formValid.emit(status === 'VALID' ? true : false);
    });
  }

  private fillForm(value: IRole): void {
    this.rolesForm.setValue({
      name: value?.name ?? '',
      permissions: value?.permissions ? value.permissions.map(permission => ({ name: `${permission.name}-${permission.type}`, _id: permission._id })) : [],
    });
  }

  private setFormErrors(): void {
    this.formErrors = {
      name: {
        formControl: this.rolesForm?.get?.('name'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['NAME'] }
        ]
      }
    }
  }
}
