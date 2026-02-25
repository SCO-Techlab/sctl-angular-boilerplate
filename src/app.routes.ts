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
  //{ path: 'landing', component: Landing },
  { path: 'notfound', component: NotfoundComponent },
  // { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
  { path: '**', redirectTo: '/notfound' }
];
