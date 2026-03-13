import { Routes } from '@angular/router';
import { MenuFrontComponent, UsersComponent } from './containers';
import { AdminGuard } from '@shared/guards';
import { ROLES } from '@shared/constants';

export default [
  {
    path: 'menu-front',
    component: MenuFrontComponent,
    canActivate: [AdminGuard],
    data: { roles: [ROLES.SUPERADMIN] }
  },
    {
    path: 'users',
    component: UsersComponent,
    canActivate: [AdminGuard],
    data: { roles: [ROLES.SUPERADMIN, ROLES.ADMIN] }
  }
] as Routes;