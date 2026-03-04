import { IInputErrorComponent } from "@shared/interfaces";
import { IAuthHeaderComponent } from "./auth-header.interface";
import { IAuthInputComponent } from "./auth-input.interface";
import { IAuthLinkComponent } from "./auth-link.interface";

export interface IAuthResetPasswordComponent {
  showConfigurator?: boolean;
  headerConfig?: IAuthHeaderComponent;
  inputs?: {
    password?: IAuthInputComponent;
    confirmPassword?: IAuthInputComponent;
  };
  links?: IAuthLinkComponent[];
  buttonLabel?: string;
  formErrors?: {
    password?: IInputErrorComponent;
    confirmPassword?: IInputErrorComponent;
  }
}