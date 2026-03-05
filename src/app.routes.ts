import { Routes } from '@angular/router';
import { AccessComponent, ErrorComponent, LayoutComponent } from '@layout/containers';
import { DashboardComponent } from '@modules/dashboard';
import { NotfoundComponent } from '@shared/components';
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
  { path: 'error', component: ErrorComponent },
  { path: 'notfound', component: NotfoundComponent },
  { path: '**', redirectTo: '/notfound' }
];
