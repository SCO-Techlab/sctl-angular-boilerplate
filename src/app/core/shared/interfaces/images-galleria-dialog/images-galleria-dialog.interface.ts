import { IDialogComponent } from "../dialog";
import { IImagesGalleriaComponent } from "../images-galleria";

export interface IImagesGalleriaDialogComponent {
  dialogConfig: IDialogComponent;
  imagesGalleriaConfig: IImagesGalleriaComponent;
  imagesSrc: string;
}