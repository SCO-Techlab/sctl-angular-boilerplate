import { IInputErrorComponent } from "@shared/interfaces";

export interface IForgotPasswordComponent {
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
  linkEnabled?: boolean;
  linkLabel?: string;
  linkUrl?: string;
  buttonLabel?: string;
  formErrors?: {
    email?: IInputErrorComponent;
  }
}