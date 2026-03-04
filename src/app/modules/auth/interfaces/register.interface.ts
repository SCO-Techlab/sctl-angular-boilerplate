import { IInputErrorComponent } from "@shared/interfaces";
import { IAuthHeaderComponent } from "./auth-header.interface";
import { IAuthLinkComponent } from "./auth-link.interface";
import { IAuthInputComponent } from "./auth-input.interface";

export interface IRegisterComponent {
  showConfigurator?: boolean;
  headerConfig?: IAuthHeaderComponent;
  inputs?: {
    email?: IAuthInputComponent;
    password?: IAuthInputComponent;
    confirmPassword?: IAuthInputComponent;
  };
  links?: IAuthLinkComponent[];
  buttonLabel?: string;
  formErrors?: {
    email?: IInputErrorComponent;
    password?: IInputErrorComponent;
    confirmPassword?: IInputErrorComponent;
  }
}