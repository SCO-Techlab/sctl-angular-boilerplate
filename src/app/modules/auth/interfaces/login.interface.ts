import { IInputErrorComponent } from "@shared/interfaces";
import { IAuthHeaderComponent } from "./auth-header.interface";
import { IAuthLinkComponent } from "./auth-link.interface";

export interface ILoginComponent {
  showConfigurator?: boolean;
  headerConfig?: IAuthHeaderComponent;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  rememberMeEnabled?: boolean;
  rememberMeLabel?: string;
  links?: IAuthLinkComponent[];
  buttonLabel?: string;
  initialValues?: {
    email?: string;
    password?: string;
    rememberMe?: boolean;
  },
  formErrors?: {
    email?: IInputErrorComponent;
    password?: IInputErrorComponent;
  }
}

export interface ILoginComponentEvent {
  email: string;
  password: string;
  rememberMe: boolean;
  autoLogin?: boolean;
}