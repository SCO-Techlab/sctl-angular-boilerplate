import { IInputErrorComponent } from "@shared/interfaces";

export interface ILoginComponent {
  showConfigurator?: boolean;
  showLogo?: boolean;
  logoUrl?: string;
  logoText?: string;
  logoRedirect?: string;
  logoCssClass?: string;
  title?: string;
  subTitle?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  rememberMeEnabled?: boolean;
  rememberMeLabel?: string;
  forgotPasswordEnabled?: boolean;
  forgotPasswordLabel?: string;
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