import { Routes } from '@angular/router';
import DashboardComponent from './dashboard/dashboard.component';
import { FoodandhydrationComponent } from './foodandhydration/foodandhydration.component';
import { LoginComponent } from './login/login.component';
import { QRcodeComponent } from './qrcode/qrcode.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { AuthGuard } from './services/auth/auth.guard';
import { BothAuthGuard } from './services/auth/both-auth.guard';
import { StafftrackingComponent } from './stafftracking/stafftracking.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { UsermanagementComponent } from './usermanagement/usermanagement.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [BothAuthGuard] },
  { path: 'QRcode', component: QRcodeComponent, canActivate: [BothAuthGuard] },
  { path: 'fyh', component: FoodandhydrationComponent, canActivate: [BothAuthGuard] },
  { path: 'stafftracking', component: StafftrackingComponent, canActivate: [AuthGuard] },
  { path: 'access-denied', component: AccessDeniedComponent, canActivate: [BothAuthGuard] },
  { path: 'confirm', component: ConfirmationComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UsermanagementComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
