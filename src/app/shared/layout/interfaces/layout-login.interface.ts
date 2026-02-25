import { IInputErrorComponent } from '../../components/input-error';

export interface ILayoutLogin {
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

export interface ILayoutLoginEvent {
  email: string;
  password: string;
  rememberMe: boolean;
  rememberMeLogin?: boolean;
}