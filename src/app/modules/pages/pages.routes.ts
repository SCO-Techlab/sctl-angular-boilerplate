import { Routes } from '@angular/router';

export default [
  { path: 'rooms', loadChildren: () => import('./rooms/rooms.routes') },
  { path: 'residences', loadChildren: () => import('./residences/residences.routes') },
  { path: 'customers', loadChildren: () => import('./customers/customers.routes') },
  { path: 'images', loadChildren: () => import('./images/images.routes') },
  { path: 'bookings', loadChildren: () => import('./bookings/bookings.routes') },
  { path: 'information-emails', loadChildren: () => import('./information-emails/information-emails.routes') },
] as Routes;