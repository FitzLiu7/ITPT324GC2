import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { signIn, signOut } from 'aws-amplify/auth'; // Removed signOut since it's not needed here
import { AuthService } from '../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  showPassword = false;

  constructor(private router: Router, private authService: AuthService) {}

  // Toggle visibility of the password
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    this.errorMessage = '';

    try {
      await signOut();
      const { isSignedIn } = await signIn({
        username: this.username,
        password: this.password,
      });

      if (isSignedIn) {
        const role = this.authService.getRoleFromUsername(this.username);
        console.log(`User logged in with role: ${role}`);

        // Store user info with role
        this.authService.setCurrentUser({
          username: this.username,
          role: role,
        });

        // Redirect based on role
        this.redirectUser(role);
      } else {
        this.errorMessage = 'Unable to sign in.';
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message || 'An error occurred during login';
      console.error('Login error:', error);
      this.errorMessage = errorMessage;
    }
  }

  // Redirect user based on their role
  private redirectUser(role: string) {
    switch (role) {
      case 'Manager':
        this.router.navigate(['/dashboard']); // Specific route for Managers
        break;
      case 'Staff':
        this.router.navigate(['/fyh']); // Specific route for Staff
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
