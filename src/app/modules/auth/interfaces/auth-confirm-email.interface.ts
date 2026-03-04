import { IAuthHeaderComponent } from "./auth-header.interface";

export interface IAuthConfirmEmailComponent {
  showConfigurator?: boolean;
  headerConfig?: IAuthHeaderComponent;
  successMessage?: string;
  errorMessage?: string;
  buttonLabel?: string;
  buttonRedirect?: string;
}