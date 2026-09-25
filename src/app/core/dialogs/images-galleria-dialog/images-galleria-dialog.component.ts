import { NgClass } from '@angular/common';
import { Component, effect, input, OnInit, output } from '@angular/core';
import { DialogComponent } from '@core/components/dialog';
import { ImagesGalleriaComponent } from '@core/components/images-galleria';
import { FILE_SIZES, MAGIC_NUMBERS } from '@core/shared';
import { BUTTON_SEVERITY } from '@core/shared/enums';
import { IImagesGalleriaDialogComponent } from '@core/shared/interfaces';

@Component({
  selector: 'sctl-images-galleria-dialog',
  standalone: true,
  templateUrl: './images-galleria-dialog.component.html',
  imports: [
    NgClass,
    DialogComponent,
    ImagesGalleriaComponent,
  ]
})
export class ImagesGalleriaDialogComponent implements OnInit {

  public visible = input<boolean>(false);
  public values = input<string[]>([]);
  public config = input<IImagesGalleriaDialogComponent>({
    dialogConfig: {
      closeOnSubmit: false,
      fullScreen: false,
      header: {
        closable: true,
        title: 'Images Galleria Dialog',
        subTitle: 'Images Galleria Dialog sub title'
      },
      footer: {
        cancelButton: {
          show: true,
          label: 'Close',
          severity: BUTTON_SEVERITY.SECONDARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        },
        submitButton: {
          show: false,
          label: 'Save',
          severity: BUTTON_SEVERITY.PRIMARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        }
      }
    },
    imagesGalleriaConfig: {
      showLabel: true,
      showAddImageButton: true,
      showDeleteImageButton: true,
      showImageTitleIndex: true,
      maxFileSizeMb: FILE_SIZES.MB_5,
      maxFiles: MAGIC_NUMBERS.N_5,
    },
    imagesSrc: ''
  });

  public submit = output<void>();
  public close = output<void>();
  public addImages = output<File[]>();
  public deleteImage = output<number>();

  public showDialog: boolean = false;

  constructor() {
    effect(() => {
      this.visible;
      this.showDialog = this.visible();
    })
  }

  ngOnInit(): void {
    this.showDialog = this.visible();
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

  public onUploadImages($event: File[]): void {
    this.addImages.emit($event);
  }

  public onDeleteImage($event: number): void {
    this.deleteImage.emit($event);
  }
}
