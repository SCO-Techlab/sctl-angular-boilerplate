import { Component, effect, input, OnInit, output } from '@angular/core';
import { DialogComponent } from '@core/components';
import { BUTTON_SEVERITY } from '@core/shared/enums';
import { FILE_SIZES } from '@shared/constants';
import { IFileUploadDialogComponent } from '@shared/interfaces';
import { FileRemoveEvent, FileSelectEvent, FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'sctl-file-upload-dialog',
  standalone: true,
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss'],
  imports: [
    DialogComponent,
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

  public onSubmit(closeOnSubmit: boolean): void {
    if (closeOnSubmit) {
      this.showDialog = false;
    }

    this.submit.emit();
  }
}
