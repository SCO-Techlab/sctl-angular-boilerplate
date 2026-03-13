import { Routes } from '@angular/router';
import { MenuFrontComponent } from './containers';
import { AdminGuard } from '@shared/guards';

export default [
  {
    path: 'menu-front',
    component: MenuFrontComponent,
    canActivate: [AdminGuard]
  }
] as Routes;