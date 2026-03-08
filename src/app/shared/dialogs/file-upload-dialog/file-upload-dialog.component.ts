import { Component, effect, input, OnInit, output } from '@angular/core';
import { FILE_SIZES, MAGIC_NUMBERS } from '@shared/constants';
import { BUTTON_SEVERITY } from '@shared/enums';
import { IFileUploadDialogComponent } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FileRemoveEvent, FileSelectEvent, FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'sctl-file-upload-dialog',
  standalone: true,
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss'],
  imports: [
    DialogModule,
    ButtonModule,
    FileUploadModule
  ]
})
export class FileUploadDialogComponent implements OnInit {

  public visible = input<boolean>(false);
  public config = input<IFileUploadDialogComponent>({
    dialogConfig: {
      closeOnSubmit: false,
      header: {
        closable: true,
        title: 'Update Avatar',
        subTitle: 'Update your information'
      },
      footer: {
        cancelButton: {
          show: true,
          label: 'Cancel',
          severity: BUTTON_SEVERITY.SECONDARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        },
        submitButton: {
          show: true,
          label: 'Save',
          severity: BUTTON_SEVERITY.PRIMARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        }
      }
    },
    multiple: false,
    accept: 'image/*',
    chooseLabel: 'Select',
    cancelLabel: 'Clear',
    maxFileSize: FILE_SIZES.MB_1,
  });

  public select = output<File[]>();
  public clear = output<File[]>();
  public submit = output<void>();
  public close = output<void>();

  public showDialog: boolean = false;
  public files: File[] = [];

  public get showHeader(): boolean {
    return this.config()?.dialogConfig?.header?.title?.length > MAGIC_NUMBERS.N_0 ||
      this.config()?.dialogConfig?.header?.subTitle?.length > MAGIC_NUMBERS.N_0 ||
      this.config()?.dialogConfig?.header?.closable;
  }

  public get showFooter(): boolean {
    return this.config()?.dialogConfig?.footer?.cancelButton?.show || this.config()?.dialogConfig?.footer?.submitButton?.show;
  }

  public get cancelButtonDisabled(): boolean {
    return !this.config()?.dialogConfig?.footer?.cancelButton?.disabled
      ? false
      : this.config()?.dialogConfig?.footer?.cancelButton?.disabled();
  }

  public get submitButtonDisabled(): boolean {
    return !this.config()?.dialogConfig?.footer?.submitButton?.disabled
      ? false
      : this.config()?.dialogConfig?.footer?.submitButton?.disabled();
  }

  constructor() {
    effect(() => {
      this.visible;
      this.showDialog = this.visible();
    })
  }

  ngOnInit(): void {
    this.showDialog = this.visible();
  }

  public onSelectFiles($event: FileSelectEvent): void {
    this.files = !$event?.currentFiles?.length 
      ? [] 
      : $event?.currentFiles;
    
    this.select.emit(this.files);
  }

  public onClearFiles(): void {
    this.files = [];
    this.clear.emit(this.files);
  }

  public onRemoveFile($event: FileRemoveEvent): void {
    this.files = this.files?.filter(f => f !== $event.file);
    this.clear.emit(this.files);
  }

  public onClose(): void {
    this.showDialog = false;
    this.close.emit();
  }

  public onSubmit(): void {
    if (this.config()?.dialogConfig?.closeOnSubmit) {
      this.showDialog = false;
    }

    this.submit.emit();
  }
}
