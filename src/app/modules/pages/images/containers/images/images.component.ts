import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardComponent } from '@core/components';
import { ImagesGalleriaDialogComponent } from '@core/dialogs';
import { BUTTON_SEVERITY, FILE_SIZES, IImagesGalleriaDialogComponent, MAGIC_NUMBERS, TranslateModule, TranslateService } from '@core/shared';
import { environment } from '@environment';
import { formatResidenceAddress } from '@shared/helpers';
import { SelectTenantService, UserService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TabsModule } from 'primeng/tabs';
import { IMAGES_TABS } from '../../enums';
import { IImageItem, ITenantImages } from '../../interfaces';
import { ImagesService } from '../../services';

@Component({
  selector: 'sctl-images',
  standalone: true,
  templateUrl: './images.component.html',
  imports: [
    NgClass,
    TranslateModule,
    TabsModule,
    CardComponent,
    DataViewModule,
    ButtonModule,
    ImagesGalleriaDialogComponent,
  ]
})
export class ImagesComponent implements OnInit {

  public readonly IMAGES_TABS = IMAGES_TABS;
  public currentTab: IMAGES_TABS;

  public images = signal<ITenantImages>(null);
  public items = signal<IImageItem[]>([]);

  public imagesGalleriaDialogConfig = signal<IImagesGalleriaDialogComponent>(null);
  public showImagesGalleriaDialog = signal<boolean>(false);
  public imagesGalleriaIds = signal<string[]>([]);

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly selectTenantService = inject(SelectTenantService);
  private readonly userService = inject(UserService);
  private readonly imagesService = inject(ImagesService);

  ngOnInit() {
    this.currentTab = this.IMAGES_TABS.RESIDENCES;
    this.listenToTenantChanges();
  }

  public onTabChange($event: string | number): void {
    if ($event === this.currentTab) {
      return;
    }

    this.currentTab = $event as IMAGES_TABS;
    this.setImagesItems(this.images());
  }

  public onOpenImagesGalleria(item: IImageItem): void {
    const ids = {
      [IMAGES_TABS.RESIDENCES]: item?.item?.images?.map(image => image) ?? [],
      [IMAGES_TABS.ROOMS]: item?.item?.images?.map(image => image) ?? []
    };

    this.imagesGalleriaIds.set(ids[this.currentTab]);
    this.setImagesGalleriaConfig(item);
    this.showImagesGalleriaDialog.set(true);
  }

  private listenToTenantChanges(): void {
    this.selectTenantService.onTenantChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadImages()
      });
  }

  private loadImages(): void {
    this.imagesService.getTenantImages(this.userService.loggedUser()?._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (images) => {
          this.images.set(images);
          this.setImagesItems(images);
        }
      });
  }

  private setImagesItems(images: ITenantImages) {
    const selectedImages = images[this.currentTab];
    if (!selectedImages?.length) {
      this.items.set([]);
      return;
    }

    const src = {
      [IMAGES_TABS.RESIDENCES]: (item) => {
        return `${environment.apiUrl}/residences/get/image/${item?._id}/{imageId}/${this.selectTenantService.selectedTenant}`;
      },
      [IMAGES_TABS.ROOMS]: (item) => {
        return `${environment.apiUrl}/rooms/get/image/${item?._id}/{imageId}/${this.selectTenantService.selectedTenant}`;
      }
    }

    const name = {
      [IMAGES_TABS.RESIDENCES]: (item) => {
        return formatResidenceAddress(item);
      },
      [IMAGES_TABS.ROOMS]: (item) => {
        return `${item?.name} (${formatResidenceAddress(item?.residence)})`;
      }
    };

    const type = {
      [IMAGES_TABS.RESIDENCES]: this.translateService.instant('PAGES.IMAGES.RESIDENCES'),
      [IMAGES_TABS.ROOMS]: this.translateService.instant('PAGES.IMAGES.ROOMS')
    };

    const items = selectedImages.map(item => ({
      item: item,
      src: src[this.currentTab](item),
      formatSrc: src[this.currentTab](item).replace('{imageId}', item?.images?.[MAGIC_NUMBERS.N_0] ?? ''),
      name: name[this.currentTab](item),
      type: type[this.currentTab],
      viewDisabled: item?.images?.length === MAGIC_NUMBERS.N_0,
    }));
    this.items.set(items);
  }

  private setImagesGalleriaConfig(item: IImageItem): void {
    this.imagesGalleriaDialogConfig.set({
      dialogConfig: {
        closeOnSubmit: false,
        fullScreen: true,
        header: {
          closable: true,
          title: this.translateService.instant('PAGES.IMAGES.GALLERIA.TITLE'),
          subTitle: item.name,
        },
        footer: {
          cancelButton: {
            show: true,
            label: this.translateService.instant('PAGES.IMAGES.GALLERIA.CANCEL'),
            severity: BUTTON_SEVERITY.SECONDARY,
            outlined: true,
            text: false,
            rounded: false,
            disabled: undefined
          },
          submitButton: {
            show: false,
            label: '',
            severity: BUTTON_SEVERITY.PRIMARY,
            outlined: true,
            text: false,
            rounded: false
          }
        }
      },
      imagesGalleriaConfig: {
        showLabel: false,
        showAddImageButton: false,
        showDeleteImageButton: false,
        showImageTitleIndex: false,
        maxFileSizeMb: FILE_SIZES.MB_5,
        maxFiles: MAGIC_NUMBERS.N_99,
      },
      imagesSrc: item.src
    });
  }
}
