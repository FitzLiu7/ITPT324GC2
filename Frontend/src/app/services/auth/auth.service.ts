import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor() {}

  // Determine role based on the username prefix
  getRoleFromUsername(username: string): string {
    if (username.startsWith('MG')) {
      return 'Manager';
    } else if (username.startsWith('ST')) {
      return 'Staff';
    } else {
      return 'Unknown';
    }
  }

  // Store user info (including role) in localStorage
  setCurrentUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Get the currently logged-in user (if any) from localStorage
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Clear user info on logout
  clearCurrentUser(): void {
    localStorage.removeItem('user');
  }
}
