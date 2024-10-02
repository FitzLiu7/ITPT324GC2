import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'authToken';
  private readonly userKey = 'user';

  constructor() {}

  // Store user info (including role) in sessionStorage
  setCurrentUser(user: any): void {
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Get the currently logged-in user (if any) from sessionStorage
  getCurrentUser(): any {
    const user = sessionStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  // Clear user info on logout
  clearCurrentUser(): void {
    sessionStorage.removeItem(this.userKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  // Determine role based on the username prefix
  getRoleFromUsername(username: string): string {
    if (username.startsWith('MG')) {
      return 'Manager';
    } else if (username.startsWith('ST')) {
      return 'Staff';
   } else if (username.startsWith('SP')) {
      return 'Manager'; 
    } else {
      return 'Unknown';
    }
  }
}
