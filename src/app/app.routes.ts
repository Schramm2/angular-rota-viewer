
import { Routes } from '@angular/router';
import { PlaceholderComponent } from './placeholder.component';
import { RosterDayComponent } from './features/roster/roster-day.component';

export const routes: Routes = [
  { path: '', component: RosterDayComponent },
  { path: 'reports', component: PlaceholderComponent },
  { path: '**', redirectTo: '' }
];
