import { Routes } from '@angular/router';
import DashboardComponent from './dashboard/dashboard.component';
import { FoodandhydrationComponent } from './foodandhydration/foodandhydration.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'fyh', component: FoodandhydrationComponent },
];
