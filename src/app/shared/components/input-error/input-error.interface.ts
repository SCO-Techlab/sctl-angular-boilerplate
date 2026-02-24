import { AbstractControl } from '@angular/forms';
import { INPUT_ERROR } from './input-error.enum';

export interface IInputErrorComponent {
  cssClass?: string;
  formControl?: AbstractControl<any, any, any>;
  errorsToShow?: IInputErrorComponentError[];
}

export interface IInputErrorComponentError { 
  error: INPUT_ERROR | string;
  message: string;
}