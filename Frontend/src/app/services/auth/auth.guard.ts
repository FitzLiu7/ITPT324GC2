import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();
    
    if (user && user.role === 'Manager') {
      // Allow access if user is a Manager
      return true;
    } else {
      // Redirect to a different route if the user is not authorized
      this.router.navigate(['/access-denied']);
      return false;
    }
  }
}
