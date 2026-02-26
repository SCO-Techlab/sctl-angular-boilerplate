import { IInputErrorComponent } from "@shared/interfaces";
import { IAuthHeaderComponent } from "./auth-header.interface";
import { IAuthLinkComponent } from "./auth-link.interface";

export interface IRegisterComponent {
  showConfigurator?: boolean;
  headerConfig?: IAuthHeaderComponent;
  emailLabel?: string;
  emailPlaceholder?: string;
  links?: IAuthLinkComponent[];
  buttonLabel?: string;
  formErrors?: {
    email?: IInputErrorComponent;
  }
}