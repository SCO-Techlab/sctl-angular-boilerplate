import { ILoaderComponent } from "./loader.interface";

export interface ISpinnerComponent {
  pathImg?: string;
  loaderMode: boolean;
  loaderConfig?: ILoaderComponent;
}