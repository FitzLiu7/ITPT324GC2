import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.authService.getUserRole();
    if (role === 'Manager') {
      return true;
    } else if (role === 'Staff') {
      this.router.navigate(['/access-denied']);
      return false;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
