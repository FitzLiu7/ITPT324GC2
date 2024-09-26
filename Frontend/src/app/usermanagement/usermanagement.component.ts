import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { NgForOf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-usermanagement',
  standalone: true,
  imports: [NgForOf, CommonModule, ReactiveFormsModule],
  templateUrl: './usermanagement.component.html',
  styleUrl: './usermanagement.component.css',
})
export class UsermanagementComponent {
  employeeList: Array<any> = [];
  signupForm: FormGroup;
  userAddedMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Initialize the signup form with validation rules
    this.signupForm = this.fb.group(
      {
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
      },
      {
        validators: this.passwordsMatchValidator,
      }
    );
  }

  // Custom validator to check if passwords match
  passwordsMatchValidator(
    formGroup: FormGroup
  ): null | { passwordsMismatch: true } {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  // Method to toggle show/hide password
  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.signupForm.valid) {
      const { username, password, email } = this.signupForm.value;

      this.apiService.signUp(username, password, email).subscribe({
        next: (response) => {
          this.userAddedMessage = 'User added successfully!';
          this.router.navigate(['/confirm'], { queryParams: { username } });
          this.signupForm.reset(); // Reset the form after successful signup
        },
        error: (err) => {
          this.userAddedMessage = 'Error adding user: ' + err.message;
        },
      });
    }
  }
}
