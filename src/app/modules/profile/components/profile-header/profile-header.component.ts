import { NgClass, NgStyle, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SetAccessToken } from '@core/session-storage';
import { ProfileService } from '@modules/profile/services';
import { Store } from '@ngxs/store';
import { CardComponent, FileUploadDialogComponent, UserAvatarComponent } from '@shared/components';
import { FILE_SIZES, MAGIC_NUMBERS } from '@shared/constants';
import { BUTTON_SEVERITY } from '@shared/enums';
import { ICardComponent, IFileUploadDialogComponent, IJwtToken, ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ScreenService, SpinnerService, ToastService, TranslateService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-profile-header',
  standalone: true,
  templateUrl: './profile-header.component.html',
  imports: [
    NgClass,
    NgStyle,
    TitleCasePipe,
    TranslateModule,
    ButtonModule,
    MessageModule,
    CardComponent,
    FileUploadDialogComponent,
    UserAvatarComponent
  ]
})
export class ProfileHeaderComponent implements OnInit {
  public user = input<IUser>();

  public cardConfig: ICardComponent = {
    title: '',
    contrast: true,
    noPadding: true
  };
  public literals: ITranslateLiterals;
  public fileUploadDialogConfig: IFileUploadDialogComponent;
  public showFileUploadDialog: boolean = false;
  public files: File[] = [];

  public get headerUsername(): string {
    return this.user()?.personalName ?? this.user()?.userName ?? 'Usuario';
  }

  public get userStatusColor(): string {
    return this.user()?.active ? 'var(--p-message-success-color)' : 'var(--p-message-error-color)';
  }

  public screenService = inject(ScreenService);
  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private profileService = inject(ProfileService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);
  private store = inject(Store);

  ngOnInit(): void {
    this.translateService.stream('PROFILE.HEADER')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFileUploadDialogConfig();
      });
  }

  public onCloseFileUploadDialog(): void {
    this.showFileUploadDialog = false;
    this.files = [];
  }

  public onSubmitFileUploadDialog(): void {
    this.spinnerService.show();
    this.profileService.updateUserAvatar(this.user()?._id, this.files[0])
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (token: IJwtToken) => {
          if (!token?.accessToken) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['AVATAR_MODAL']['REQUEST_KO']
            });
            return;
          }

          this.store.dispatch(new SetAccessToken({ accessToken: token.accessToken }));
          this.files = [];
          this.showFileUploadDialog = false;
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
}
