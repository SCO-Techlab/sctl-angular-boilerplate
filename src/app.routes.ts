import { Routes } from '@angular/router';
import { AuthGuard } from '@guards';
import { LayoutComponent } from '@layout/containers';
import { DashboardComponent } from '@modules/dashboard';
import { AccessComponent, NotfoundComponent } from '@shared/components';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
    ],
    canActivate: [AuthGuard],
  },
  { path: 'auth', loadChildren: () => import('./app/modules/auth/auth.routes') },
  { path: 'access', component: AccessComponent },
  { path: 'notfound', component: NotfoundComponent },
  { path: '**', redirectTo: '/notfound' }
];
