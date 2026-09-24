import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, computed, DestroyRef, inject, input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileUploadDialogComponent } from '@core/dialogs/file-upload-dialog';
import { BUTTON_SEVERITY, ConfirmDialogService, FILE_SIZES, FILE_SIZES_MB, IFileUploadDialogComponent, IImagesGalleria, IImagesGalleriaComponent, ITranslateLiterals, MAGIC_NUMBERS, TranslateModule, TranslateService } from '@core/shared';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'sctl-images-galleria',
  standalone: true,
  templateUrl: './images-galleria.component.html',
  styleUrls: ['./images-galleria.component.scss'],
  imports: [
    NgClass,
    TranslateModule,
    GalleriaModule,
    ButtonModule,
    FileUploadDialogComponent,
  ]
})
export class ImagesGalleriaComponent implements OnInit, OnChanges {

  public config = input<IImagesGalleriaComponent>({
    showLabel: true,
    showAddImageButton: true,
    showDeleteImageButton: true,
    showImageTitleIndex: true,
    maxFileSizeMb: FILE_SIZES.MB_5,
    maxFiles: MAGIC_NUMBERS.N_5,
  });
  public images = input<string[]>([]);
  public imageSrc = input<string>('');

  public addImages = output<File[]>();
  public deleteImage = output<number>();

  public literals: ITranslateLiterals;
  public galleriaImages: IImagesGalleria[] = [];
  public numVisible: number = MAGIC_NUMBERS.N_1;
  public fileUploadDialogConfig: IFileUploadDialogComponent;
  public showFileUploadDialog: boolean = false;
  public showGalleria: boolean = true;
  public imageIndex: number = MAGIC_NUMBERS.N_0;
  public files: File[] = [];
  public canManageFiles = computed(() => this.images()?.length < this.config().maxFiles);
  public fileLimit = computed(() => {
    const maxFiles = this.config().maxFiles;
    const currentFiles = this.images()?.length ?? MAGIC_NUMBERS.N_0;
    return maxFiles - currentFiles;
  });

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly cdRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.syncGalleriaState(this.images());
    this.translateService.stream('SHARED.COMPONENTS.IMAGES_GALLERIA')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFileUploadDialogConfig();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images']) {
      this.syncGalleriaState(changes['images'].currentValue ?? []);
      this.fileUploadDialogConfig = {
        ...this.fileUploadDialogConfig,
        fileLimit: this.fileLimit()
      };
      this.refreshGalleria();
    }
  }

  public onChangeActiveIndex(index: number): void {
    this.imageIndex = index;
  }

  public onCloseFileUploadDialog(): void {
    this.showFileUploadDialog = false;
    this.files = [];
  }

  public onSubmitFileUploadDialog(): void {
    this.addImages.emit(this.files);
    this.onCloseFileUploadDialog();
  }

  public onDeleteImage(): void {
    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE_IMAGE']?.['HEADER'],
      message: this.literals?.['DELETE_IMAGE']?.['MESSAGE'],
      rejectButton: { label: this.literals?.['DELETE_IMAGE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE_IMAGE']?.['SUBMIT'] },
      accept: () => this.deleteImage.emit(this.imageIndex)
    });
  }

  private syncGalleriaState(images: string[]): void {
    const safeImages = images ?? [];
    this.galleriaImages = this.mapGalleriaImages(safeImages);

    const totalImages = safeImages.length;
    this.numVisible = Math.max(
      MAGIC_NUMBERS.N_1,
      Math.min(MAGIC_NUMBERS.N_5, totalImages || MAGIC_NUMBERS.N_1)
    );

    if (totalImages === MAGIC_NUMBERS.N_0) {
      this.imageIndex = MAGIC_NUMBERS.N_0;
      return;
    }

    this.imageIndex = Math.min(this.imageIndex, totalImages - MAGIC_NUMBERS.N_1);
  }

  private setFileUploadDialogConfig(): void {
    this.fileUploadDialogConfig = {
      dialogConfig: {
        closeOnSubmit: false,
        header: {
          closable: true,
          title: this.literals?.['IMAGES_MODAL']['TITLE'],
          subTitle: `${this.literals?.['IMAGES_MODAL']['SUB_TITLE']} ${FILE_SIZES_MB[this.config().maxFileSizeMb]}MB`
        },
        footer: {
          cancelButton: {
            show: true,
            label: this.literals?.['IMAGES_MODAL']['CANCEL'],
            severity: BUTTON_SEVERITY.SECONDARY,
            outlined: true,
            text: false,
            rounded: false,
            disabled: undefined
          },
          submitButton: {
            show: true,
            label: this.literals?.['IMAGES_MODAL']['SUBMIT'],
            severity: BUTTON_SEVERITY.PRIMARY,
            outlined: true,
            text: false,
            rounded: false,
            disabled: () => { return this.files?.length > MAGIC_NUMBERS.N_0 ? false : true; }
          }
        }
      },
      multiple: true,
      accept: 'image/*',
      chooseLabel: this.literals?.['IMAGES_MODAL']['SELECT'],
      cancelLabel: this.literals?.['IMAGES_MODAL']['CLEAR'],
      maxFileSize: this.config().maxFileSizeMb,
      fileLimit: this.fileLimit(),
    };
  }

  private mapGalleriaImages(images: string[]): IImagesGalleria[] {
    return images?.map((image: string, index: number) => {
      const title = this.config()?.showImageTitleIndex
        ? `${this.literals?.['IMAGEN_TITLE']} ${index + MAGIC_NUMBERS.N_1}`
        : this.literals?.['IMAGEN_TITLE'];

      return {
        imageId: image,
        imageSrc: this.formatImageSrc(image),
        alt: '',
        title: title,
      }
    }) ?? [];
  }

  private formatImageSrc(imageId: string): string {
    const imageSrc = this.imageSrc()?.replace('{imageId}', imageId);
    return imageSrc ?? '';
  }

  private refreshGalleria(): void {
    this.showGalleria = false;
    this.cdRef.detectChanges();

    queueMicrotask(() => {
      this.showGalleria = true;
      this.cdRef.detectChanges();
    });
  }
}
