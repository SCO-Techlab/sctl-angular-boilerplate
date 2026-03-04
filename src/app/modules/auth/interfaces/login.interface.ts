import { IInputErrorComponent } from "@shared/interfaces";
import { IAuthHeaderComponent } from "./auth-header.interface";
import { IAuthLinkComponent } from "./auth-link.interface";
import { IAuthInputComponent } from "./auth-input.interface";

export interface ILoginComponent {
  showConfigurator?: boolean;
  headerConfig?: IAuthHeaderComponent;
  inputs?: {
    email?: IAuthInputComponent;
    password?: IAuthInputComponent;
    rememberMe?: IAuthInputComponent;
  };
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
}