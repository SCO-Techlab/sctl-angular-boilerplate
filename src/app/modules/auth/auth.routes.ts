import { Routes } from '@angular/router';
import { ForgotPasswordComponent, LoginComponent, RegisterComponent } from './containers';

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
  }
] as Routes;