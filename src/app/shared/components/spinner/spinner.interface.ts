import { ILoaderComponent } from '../loader/loader.interface';

export interface ISpinnerComponent {
  pathImg?: string;
  loaderMode: boolean;
  loaderConfig?: ILoaderComponent;
}