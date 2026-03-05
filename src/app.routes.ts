import { Routes } from '@angular/router';
import { LayoutComponent } from '@layout/containers/layout';
import { DashboardComponent } from '@modules/dashboard';
import { AccessComponent, NotfoundComponent } from '@shared/components';
import { AuthGuard } from '@shared/guards';

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
