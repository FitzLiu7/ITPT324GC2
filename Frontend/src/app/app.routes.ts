import { Routes } from '@angular/router';
import DashboardComponent from './dashboard/dashboard.component';
import { FoodandhydrationComponent } from './foodandhydration/foodandhydration.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'fyh', component: FoodandhydrationComponent },
];
