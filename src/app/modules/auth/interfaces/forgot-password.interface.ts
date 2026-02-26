import { IInputErrorComponent } from "@shared/interfaces";
import { IAuthHeaderComponent } from "./auth-header.interface";

export interface IForgotPasswordComponent {
  showConfigurator?: boolean;
  headerConfig?: IAuthHeaderComponent;
  emailLabel?: string;
  emailPlaceholder?: string;
  linkEnabled?: boolean;
  linkLabel?: string;
  linkUrl?: string;
  buttonLabel?: string;
  formErrors?: {
    email?: IInputErrorComponent;
  }
}