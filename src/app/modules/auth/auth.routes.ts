import { Routes } from '@angular/router';
import { ForgotPasswordComponent, LoginComponent } from './containers';

export default [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  }
] as Routes;