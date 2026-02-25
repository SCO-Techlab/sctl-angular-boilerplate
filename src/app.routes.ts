import { Routes } from '@angular/router';
import { LayoutComponent } from '@layout';
import { DashboardComponent } from './app/modules/dashboard';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      // { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
      // { path: 'documentation', component: Documentation },
      // { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
    ]
  },
  //{ path: 'landing', component: Landing },
  { path: 'notfound', component: NotfoundComponent },
  // { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
  { path: '**', redirectTo: '/notfound' }
];
