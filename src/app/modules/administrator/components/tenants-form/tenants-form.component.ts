import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '@core/components';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { UsersService } from '@modules/administrator/services';
import { ITenant, IUser } from '@shared/interfaces';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'sctl-tenants-form',
  standalone: true,
  templateUrl: './tenants-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule,
    InputErrorComponent,
    ToggleSwitchModule,
    MultiSelectModule,
  ]
})
export class TenantsFormComponent implements OnInit {

  public value = input<ITenant>();

  public valueChange = output<ITenant>();
  public formValid = output<boolean>();

  public tenantsForm: FormGroup;
  public usersOptions: { name: string; value: string }[] = [];
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;
  private firstChange: boolean;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly usersService = inject(UsersService);

  ngOnInit(): void {
    this.firstChange = true;
    this.initForm();
    this.fillForm(this.value());
    this.setUsersOptions();
    this.translateService.stream('PERMISSIONS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  private initForm(): void {
    this.tenantsForm = new FormGroup({
      name: new FormControl<string>('', [Validators.required]),
      isActive: new FormControl<boolean>(true),
      owner: new FormControl<string>('', [Validators.required]),
      members: new FormControl<string[]>([]),
      description: new FormControl<string>(''),
    });

    this.tenantsForm.valueChanges.subscribe((value: ITenant) => {
      if (this.firstChange) {
        this.firstChange = false;
        return;
      }

      if (!this.tenantsForm.valid) {
        return;
      }

      this.valueChange.emit(value);
    });

    this.tenantsForm.statusChanges.subscribe((status: string) => {
      this.formValid.emit(status === 'VALID' ? true : false);
    });
  }

  private fillForm(value: ITenant): void {
    this.tenantsForm.setValue({
      name: value?.name ?? '',
      isActive: value?.isActive ?? true,
      owner: value?.owner?._id ?? '',
      members: value?.members?.map(member => member._id) ?? [],
      description: value?.description ?? '',
    });
  }

  private setFormErrors(): void {
    this.formErrors = {
      name: {
        formControl: this.tenantsForm?.get?.('name'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['NAME'] }
        ]
      },
      owner: {
        formControl: this.tenantsForm?.get?.('owner'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['OWNER'] }
        ]
      }
    }
  }

  private setUsersOptions(): void {
    this.usersService.find(null)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IUser[]) => {
        this.usersOptions = res?.map(user => ({ name: user.email, value: user._id })) ?? [];
      });
  }
}
