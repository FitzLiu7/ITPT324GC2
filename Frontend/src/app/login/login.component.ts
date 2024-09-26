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
  showPassword = false; // Propiedad para controlar la visibilidad de la contraseña

  constructor(private router: Router, private authService: AuthService) {}

  // Método para alternar la visibilidad de la contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    try {
      await signOut();
      const { isSignedIn } = await signIn({
        username: this.username,
        password: this.password,
      });

      if (isSignedIn) {
        const role = this.authService.getRoleFromUsername(this.username);
        console.log(`User logged in with role: ${role}`);

        this.authService.setCurrentUser({
          name: this.username,
          role: role,
        });

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
      const errorMessage =
        (error as Error).message || 'An error occurred during login';
      console.error('Login error:', error);
      this.errorMessage = errorMessage;
    }
  }
}
