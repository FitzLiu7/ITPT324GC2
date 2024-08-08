import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { signIn, signOut } from 'aws-amplify/auth';
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

  constructor(private router: Router) {}

  async login() {
    try {

      await signOut();
      
      const { isSignedIn } = await signIn({ username: this.username, password: this.password });
      if (isSignedIn) {
        this.router.navigate(['/dashboard']);
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
