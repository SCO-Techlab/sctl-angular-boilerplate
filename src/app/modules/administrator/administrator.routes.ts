import { Routes } from '@angular/router';
import { ROLES } from '@shared/constants';
import { AdminGuard } from '@shared/guards';
import { MenuFrontComponent, PermissionsComponent, RefreshTokensComponent, RolesComponent, UsersComponent } from './containers';

export default [
  {
    path: 'menu-front',
    component: MenuFrontComponent,
    canActivate: [AdminGuard],
    data: { roles: [ROLES.SUPERADMIN] }
  },
  {
    path: 'refresh-tokens',
    component: RefreshTokensComponent,
    canActivate: [AdminGuard],
    data: { roles: [ROLES.SUPERADMIN] }
  },
  {
    path: 'permissions',
    component: PermissionsComponent,
    canActivate: [AdminGuard],
    data: { roles: [ROLES.SUPERADMIN] }
  },
  {
    path: 'roles',
    component: RolesComponent,
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