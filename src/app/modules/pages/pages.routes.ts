import { Routes } from '@angular/router';

export default [
  { path: 'rooms', loadChildren: () => import('./rooms/rooms.routes') },
  { path: 'residences', loadChildren: () => import('./residences/residences.routes') }
] as Routes;