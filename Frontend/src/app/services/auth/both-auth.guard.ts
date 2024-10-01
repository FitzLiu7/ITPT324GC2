import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BothAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    // Check if the user is authenticated
    if (this.authService.isAuthenticated() && user) {
      // Allow access if the user is a Manager or Staff
      if (user.role === 'Manager' || user.role === 'Staff') {
        return true;  // Managers and Staff can access the route
      } else {
        // Redirect to access-denied route if the user is not a Manager or Staff
        this.router.navigate(['/access-denied']);
        return false; // Deny access for other roles
      }
    } else {
      // Redirect to login route if the user is not authenticated
      this.router.navigate(['/login']);
      return false; // Deny access for unauthenticated users
    }
  }
}
