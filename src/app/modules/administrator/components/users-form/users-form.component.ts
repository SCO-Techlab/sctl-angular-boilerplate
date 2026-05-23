import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '@core/components';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { RolesService } from '@modules/administrator/services';
import { REGEX_PATTERNS } from '@shared/constants';
import { IRole, IUser } from '@shared/interfaces';
import { PasswordMatchValidator } from '@shared/validators';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'sctl-users-form',
  standalone: true,
  templateUrl: './users-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule,
    PasswordModule,
    ToggleSwitchModule,
    InputErrorComponent,
  ]
})
export class UsersFormComponent implements OnInit {

  public value = input<IUser>();

  public valueChange = output<IUser>();
  public formValid = output<boolean>();

  public usersForm: FormGroup;
  public rolesOptions: { name: string; _id: string }[] = [];
  public formErrors: { [key: string]: IInputErrorComponent } = {};
  public isEdit: boolean;

  private literals: ITranslateLiterals;
  private firstChange: boolean;

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private rolesService = inject(RolesService);

  ngOnInit(): void {
    this.firstChange = true;
    this.isEdit = this.value()?._id !== undefined;
    this.getRoles();
    this.initForm();
    this.fillForm(this.value());
    this.translateService.stream('USERS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  private getRoles(): void {
    this.rolesService.find(null)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IRole[]) => this.rolesOptions = res?.map(role => ({ name: role.name, _id: role._id })) ?? []);
  }

  private initForm(): void {
    this.usersForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.EMAIL)]),
      userName: new FormControl<string>('', [Validators.required]),
      personalName: new FormControl<string>('', [Validators.required]),
      role: new FormControl<IRole>(null, [Validators.required]),
      active: new FormControl<boolean>(true, [Validators.required]),
      emailConfirmed: new FormControl<boolean>(false, [Validators.required]),
    });

    if (!this.isEdit) {
      this.usersForm.addControl('password', new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]));
      this.usersForm.addControl('confirmPassword', new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]));
      this.usersForm.setValidators([PasswordMatchValidator]);
    }

    this.usersForm.valueChanges.subscribe((value: IUser) => {
      if (this.firstChange) {
        this.firstChange = false;
        return;
      }

      if (!this.usersForm.valid) {
        return;
      }

      this.valueChange.emit(value);
    });

    this.usersForm.statusChanges.subscribe((status: string) => {
      this.formValid.emit(status === 'VALID' ? true : false);
    });
  }

  private fillForm(value: IUser): void {
    let fillValue = {
      email: value?.email ?? '',
      userName: value?.userName ?? '',
      personalName: value?.personalName ?? '',
      role: value?.role ? { name: value.role.name, _id: value.role._id } : '',
      active: value?.active ?? false,
      emailConfirmed: value?.emailConfirmed ?? false,
      password: '',
      confirmPassword: ''
    };

    if (this.isEdit) {
      delete fillValue.password;
      delete fillValue.confirmPassword;
    }

    this.usersForm.setValue({ ...fillValue });
  }

  private setFormErrors(): void {
    this.formErrors = {
      email: {
        formControl: this.usersForm?.get?.('email'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['EMAIL'] },
          { error: INPUT_ERROR.PATTERN, message: this.literals?.['ERROR']?.['EMAIL_INVALID'] }
        ]
      },
      userName: {
        formControl: this.usersForm?.get?.('userName'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['USER_NAME'] }
        ]
      },
      personalName: {
        formControl: this.usersForm?.get?.('personalName'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['PERSONAL_NAME'] }
        ]
      },
      role: {
        formControl: this.usersForm?.get?.('role'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['ROLE'] }
        ]
      }
    };

    if (!this.isEdit) {
      this.formErrors = {
        ...this.formErrors,
        password: {
          formControl: this.usersForm?.get?.('password'),
          errorsToShow: [
            { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['PASSWORD'] },
            { error: INPUT_ERROR.PATTERN, message: this.literals?.['ERRORS']?.['PASSWORD_INVALID'] }
          ]
        },
        confirmPassword: {
          formControl: this.usersForm?.get?.('confirmPassword'),
          errorsToShow: [
            { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['CONFIRM_PASSWORD'] },
            { error: INPUT_ERROR.PATTERN, message: this.literals?.['ERRORS']?.['CONFIRM_PASSWORD_INVALID'] },
            { error: INPUT_ERROR.MISMATCH, message: this.literals?.['ERRORS']?.['PASSWORDS_NOT_MATCH'] }
          ]
        }
      }
    }
  }
}
