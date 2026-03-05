import { AbstractControl } from '@angular/forms';
import { INPUT_ERROR } from '@shared/enums';

export interface IInputErrorComponent {
  cssClass?: string;
  formControl?: AbstractControl<any, any, any>;
  errorsToShow?: {
    error: INPUT_ERROR | string;
    message: string;
  }[];
}