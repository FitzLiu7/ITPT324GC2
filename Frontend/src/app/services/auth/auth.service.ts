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
  setCurrentUser(user: { name: string; role: string }): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Get the currently logged-in user (if any) from localStorage
  getCurrentUser(): { name: string; role: string } | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Clear user info on logout
  clearCurrentUser(): void {
    localStorage.removeItem('user');
  }
  
  // Get the user role from localStorage
  getUserRole(): string {
    const user = this.getCurrentUser();
    return user ? user.role : 'Unknown';
  }
}
