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

    // Check if the user is authenticated
    if (this.authService.isAuthenticated() && user) {
      // Allow access if the user is a Manager
      if (user.role === 'Manager') {
        return true;  // Managers can access the route
      } else {
        // Redirect to access-denied route if the user is not a Manager
        this.router.navigate(['/access-denied']);
        return false; // Deny access for Staff or other roles
      }
    } else {
      // Redirect to login route if the user is not authenticated
      this.router.navigate(['/login']);
      return false; // Deny access for unauthenticated users
    }
  }
}
