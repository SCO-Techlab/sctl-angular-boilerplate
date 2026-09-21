import { Routes } from '@angular/router';

export default [
  { path: 'residences', loadChildren: () => import('./residences/residences.routes') }
] as Routes;