import { Routes } from '@angular/router';
import { AccessComponent, ErrorComponent, LayoutComponent, NotfoundComponent } from '@layout/containers';
import { AuthGuard } from '@shared/guards';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./app/modules/home/home.routes') },
      { path: 'profile', loadChildren: () => import('./app/modules/profile/profile.routes') },
      { path: 'administrator', loadChildren: () => import('./app/modules/administrator/administrator.routes') },
    ],
    canActivate: [AuthGuard],
  },
  { path: 'auth', loadChildren: () => import('./app/modules/auth/auth.routes') },
  { path: 'access', component: AccessComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'notfound', component: NotfoundComponent },
  { path: '**', redirectTo: '/notfound' }
];
