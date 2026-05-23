import { ILoaderComponent } from "@core/shared/interfaces";

export interface ISpinnerComponent {
  pathImg?: string;
  loaderMode: boolean;
  loaderConfig?: ILoaderComponent;
}