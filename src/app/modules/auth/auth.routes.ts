import { Routes } from '@angular/router';
import { ConfirmEmailComponent, ForgotPasswordComponent, LoginComponent, RegisterComponent, ResetPasswordComponent } from './containers';

export default [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'confirm-email/:email',
    component: ConfirmEmailComponent
  },
  {
    path: 'reset-password/:pwdRecoveryToken',
    component: ResetPasswordComponent
  }
] as Routes;