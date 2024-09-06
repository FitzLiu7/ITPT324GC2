import { Routes } from '@angular/router';
import DashboardComponent from './dashboard/dashboard.component';
import { FoodandhydrationComponent } from './foodandhydration/foodandhydration.component';
import { LoginComponent } from './login/login.component';
import { QRcodeComponent } from './qrcode/qrcode.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'QRcode', component: QRcodeComponent },
  { path: 'fyh', component: FoodandhydrationComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
