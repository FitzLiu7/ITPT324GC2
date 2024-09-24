import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { signIn, signOut } from 'aws-amplify/auth';
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

  constructor(private router: Router, private authService: AuthService) {}

  async login() {
    try {
      // Ensure user is signed out before signing in (optional)
      await signOut();

      // AWS Amplify sign-in
      const { isSignedIn } = await signIn({
        username: this.username,
        password: this.password,
      });

      if (isSignedIn) {
        // Determine the role based on the username prefix
        const role = this.authService.getRoleFromUsername(this.username);

        // Log the role to the console
        console.log(`User logged in with role: ${role}`);

        // Save the user info (including role) in localStorage
        this.authService.setCurrentUser({
          name: this.username,
          role: role
        });

        // Navigate based on the user's role
        if (role === 'Manager') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'Staff') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMessage = 'Unable to sign in.';
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'An error occurred during login';
      console.error('Login error:', error);
      this.errorMessage = errorMessage;
    }
  }
}
