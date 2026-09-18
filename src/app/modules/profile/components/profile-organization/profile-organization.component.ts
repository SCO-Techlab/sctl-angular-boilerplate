import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent, InputErrorComponent } from '@core/components';
import { FileUploadDialogComponent } from '@core/dialogs';
import { FILE_SIZES, MAGIC_NUMBERS } from '@core/shared';
import { BUTTON_SEVERITY, INPUT_ERROR } from '@core/shared/enums';
import { IFileUploadDialogComponent, IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { ScreenService, SpinnerService, ToastService, TranslateService } from '@core/shared/services';
import { environment } from '@environment';
import { LayoutService } from '@layout/services';
import { ProfileService } from '@modules/profile/services';
import { BucketAvatarComponent } from '@shared/components';
import { ITenant, IUser } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { TabsModule } from 'primeng/tabs';
import { finalize } from 'rxjs';
import { ProfileFormComponent } from '../profile-form';

@Component({
  selector: 'sctl-profile-organization',
  standalone: true,
  templateUrl: './profile-organization.component.html',
  styleUrls: ['./profile-organization.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    ButtonModule,
    TabsModule,
    ListboxModule,
    ProfileFormComponent,
    InputErrorComponent,
    BucketAvatarComponent,
    FileUploadDialogComponent,
    CardComponent,
  ]
})
export class ProfileOrganizationComponent implements OnInit {
  public user = input<IUser>();
  public tenants = input<ITenant[]>();

  public organizationForm: FormGroup;
  public lockForm: boolean = true;
  public lockState: any = undefined;
  public formErrors: { [key: string]: IInputErrorComponent } = {};
  public fileUploadDialogConfig: IFileUploadDialogComponent;
  public showFileUploadDialog: boolean = false;
  public files: File[] = [];
  public selectedTenant: number;
  public membersOptions: { name: string; value: string }[] = [];

  public get darkTheme(): boolean {
    return this.layoutService?.layoutConfig()?.darkTheme;
  }

  private literals: ITranslateLiterals;

  public readonly screenService = inject(ScreenService);
  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly profileService = inject(ProfileService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly toastService = inject(ToastService);
  private readonly layoutService = inject(LayoutService);

  ngOnInit(): void {
    this.selectedTenant = MAGIC_NUMBERS.N_0;
    this.setMembersOptions(this.selectedTenant);
    this.initForm();

    this.translateService.stream('PROFILE.ORGANIZATION')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
        this.setFileUploadDialogConfig();
      });
  }

  public onClickLockOrUnlockForm(): void {
    this.lockForm = !this.lockForm;
    this.profileService.disableOrEnableForm(this.organizationForm, this.lockForm);

    const formValues: any = this.organizationForm.value;
    if (this.lockForm) {
      this.organizationForm.setValue({ ...this.lockState });
    } else {
      this.lockState = formValues;
    }
  }

  public onTabChange($event: string | number): void {
    if ($event === this.selectedTenant) {
      return;
    }

    this.selectedTenant = $event as number;
    this.setMembersOptions(this.selectedTenant);
    this.fillForm(this.tenants()?.[this.selectedTenant]);
    if (!this.lockForm) {
      this.onClickLockOrUnlockForm();
      this.fillForm(this.tenants()?.[this.selectedTenant]);
    }
  }

  public onClickSave(): void {
    const _id: string = this.user()?._id;

    const organizationInformation: Partial<ITenant> = {
      name: this.organizationForm.value.name,
      description: this.organizationForm.value.description
    };

    const tenant = {
      ...this.tenants()?.[this.selectedTenant],
      name: organizationInformation.name,
      description: organizationInformation.description,
    }

    this.spinnerService.show();
    this.profileService.updateUserTenant(_id, tenant)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (tenant: ITenant) => {
          if (!tenant) {
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['REQUEST_KO'] });
            return;
          }

          this.tenants()[this.selectedTenant] = tenant;
          this.setMembersOptions(this.selectedTenant);
          this.fillForm(tenant);
          this.lockForm = true;
          this.lockState = true;
          this.profileService.disableOrEnableForm(this.organizationForm, true);
          this.toastService.success({ summary: this.translateService.instant('TOAST.SUCCESS'), detail: this.literals['REQUEST_OK'] });
        },
        error: (error: HttpErrorResponse) => {
          const detail: string = this.literals['REQUEST_KO'];
          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail });
        }
      });
  }

  public getTenantAvatarSrc(index: number): string {
    const tenant: ITenant = this.tenants()?.[index];
    return `${environment.apiUrl}/profile/get/tenant/avatar/${this.user()?._id}/${tenant?._id}/${tenant?.avatar}`;
  }

  public onCloseFileUploadDialog(): void {
    this.showFileUploadDialog = false;
    this.files = [];
  }

  public onSubmitFileUploadDialog(): void {
    this.spinnerService.show();
    this.profileService.updateTenantAvatar(this.user()?._id, this.tenants()?.[this.selectedTenant]?._id, this.files[MAGIC_NUMBERS.N_0])
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (tenant: ITenant) => {
          if (!tenant) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['AVATAR_MODAL']['REQUEST_KO']
            });
            return;
          }

          this.tenants()[this.selectedTenant] = tenant;
          this.files = [];
          this.showFileUploadDialog = false;
          this.lockForm = true;
          this.lockState = true;
          this.profileService.disableOrEnableForm(this.organizationForm, true);
          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['AVATAR_MODAL']['REQUEST_OK']
          });
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['AVATAR_MODAL']['REQUEST_KO'],
          })
        }
      })
  }

  public deleteTenantAvatar(index: number): void {
    this.spinnerService.show();
    this.profileService.deleteTenantAvatar(this.user()?._id, this.tenants()?.[index]?._id)
      .pipe(takeUntilDestroyed(this.destroyRef$), finalize(() => this.spinnerService.hide()))
      .subscribe({
        next: (tenant: ITenant) => {
          if (!tenant) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['AVATAR_MODAL']['DELETE_KO']
            });
            return;
          }
          this.tenants()[index] = tenant;
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['AVATAR_MODAL']['DELETE_KO'],
          })
        }
      });
  }

  public deleteMember(member: IUser): void {
    const existMemberIndex = this.tenants()?.[this.selectedTenant]?.members?.findIndex(m => m._id === member._id);
    if (existMemberIndex === -1) {
      return;
    }

    this.tenants()?.[this.selectedTenant]?.members?.splice(existMemberIndex, MAGIC_NUMBERS.N_1);
    this.onClickSave();
  }

  public userIsOwner(index: number): boolean {
    return this.tenants()?.[index]?.owner?._id === this.user()?._id;
  }

  private initForm(): void {
    this.organizationForm = new FormGroup({
      name: new FormControl(this.tenants()?.[this.selectedTenant]?.name ?? '', [Validators.required]),
      description: new FormControl(this.tenants()?.[this.selectedTenant]?.description ?? '', [Validators.required]),
      owner: new FormControl(this.tenants()?.[this.selectedTenant]?.owner?.email ?? '', [Validators.required]),
    });

    this.profileService.disableOrEnableForm(this.organizationForm, true);
  }

  private fillForm(tenant: ITenant): void {
    this.organizationForm.setValue({
      name: tenant.name ?? '',
      description: tenant.description ?? '',
      owner: tenant.owner?.email ?? '',
    });
  }

  private setFormErrors(): void {
    this.formErrors = {
      name: {
        formControl: this.organizationForm.get('name'),
        cssClass: 'mb-0',
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['NAME']
          }
        ]
      },
      description: {
        formControl: this.organizationForm.get('description'),
        cssClass: 'mb-0',
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['DESCRIPTION']
          }
        ]
      }
    };
  }

  private setFileUploadDialogConfig(): void {
    this.fileUploadDialogConfig = {
      dialogConfig: {
        closeOnSubmit: false,
        header: {
          closable: true,
          title: this.literals?.['AVATAR_MODAL']['TITLE'],
          subTitle: this.literals?.['AVATAR_MODAL']['SUB_TITLE']
        },
        footer: {
          cancelButton: {
            show: true,
            label: this.literals?.['AVATAR_MODAL']['CANCEL'],
            severity: BUTTON_SEVERITY.SECONDARY,
            outlined: true,
            text: false,
            rounded: false,
            disabled: undefined
          },
          submitButton: {
            show: true,
            label: this.literals?.['AVATAR_MODAL']['SUBMIT'],
            severity: BUTTON_SEVERITY.PRIMARY,
            outlined: true,
            text: false,
            rounded: false,
            disabled: () => { return this.files?.length > MAGIC_NUMBERS.N_0 ? false : true; }
          }
        }
      },
      multiple: false,
      accept: 'image/*',
      chooseLabel: this.literals?.['AVATAR_MODAL']['SELECT'],
      cancelLabel: this.literals?.['AVATAR_MODAL']['CLEAR'],
      maxFileSize: FILE_SIZES.MB_1,
    };
  }

  private setMembersOptions(index: number): void {
    this.membersOptions = this.tenants()?.[index]?.members?.map((member: IUser) => {
      return {
        name: member.email ?? '',
        value: member._id ?? ''
      }
    }) ?? [];
  }
}
