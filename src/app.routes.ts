import { Routes } from '@angular/router';
import { LayoutComponent } from '@layout/layout.component';
import { DashboardComponent } from '@modules/dashboard';
import { NotfoundComponent } from '@shared/components';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      // { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
    ]
  },
  { path: 'notfound', component: NotfoundComponent },
  { path: 'auth', loadChildren: () => import('./app/modules/auth/auth.routes') },
  { path: '**', redirectTo: '/notfound' }
];
