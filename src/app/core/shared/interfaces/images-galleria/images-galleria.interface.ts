export interface IImagesGalleriaComponent {
  showLabel: boolean;
  showAddImageButton: boolean;
  showDeleteImageButton: boolean;
  showImageTitleIndex: boolean;
  maxFileSizeMb: number;
  maxFiles: number;
}

export interface IImagesGalleriaResponsiveOption {
  breakpoint: string;
  numVisible: number;
}

export interface IImagesGalleria {
  imageId: string;
  imageSrc: string;
  alt: string;
  title: string;
}