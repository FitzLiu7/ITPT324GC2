import { Routes } from '@angular/router';
import DashboardComponent from './dashboard/dashboard.component';
import { FoodandhydrationComponent } from './foodandhydration/foodandhydration.component';
import { LoginComponent } from './login/login.component';
import { QRcodeComponent } from './qrcode/qrcode.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { AuthGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'QRcode', component: QRcodeComponent },
  { path: 'fyh', component: FoodandhydrationComponent },
  { path: 'access-denied', component: AccessDeniedComponent },  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
