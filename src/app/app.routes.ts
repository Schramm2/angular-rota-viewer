import { Routes } from '@angular/router';
import { PlaceholderComponent } from './placeholder.component';

export const routes: Routes = [
  { path: '', component: PlaceholderComponent },
  { path: 'reports', component: PlaceholderComponent },
  { path: '**', redirectTo: '' }
];
