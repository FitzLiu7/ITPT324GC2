import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { environment } from '../../environments/environment';

// Define interface for user attributes
interface UserAttribute {
  Name: string;
  Value: string;
}

@Component({
  selector: 'app-usermanagement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.css'],
})
export class UsermanagementComponent implements OnInit {
  signupForm: FormGroup;
  userAddedMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  employeeList: any[] = []; // Property to hold the list of employees
  deleteMessage: string = ''; // Property to show deletion messages

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) {
    // Initialize the signup form
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  ngOnInit(): void {
    // Fetch employee list on component initialization
    this.fetchEmployeeList();
  }

  // Fetch the list of employees from the API
  fetchEmployeeList(): void {
    this.apiService.getUserList().subscribe({
      next: (response) => {
        if (response.Users && Array.isArray(response.Users)) {
          this.employeeList = response.Users;
        } else {
          console.warn('Expected Users array but got:', response);
          this.employeeList = [];
        }
      },
      error: (error) => {
        console.error('Error fetching employee list:', error);
        this.employeeList = [];
      }
    });
  }
  

  // Method to delete a user
  onDeleteUser(username: string): void {
    if (confirm(`Are you sure you want to delete user: ${username}?`)) {
      this.apiService.deleteUser(username).subscribe({
        next: (response) => {
          this.deleteMessage = `User ${username} has been deleted successfully.`;
          this.fetchEmployeeList(); // Refresh the list after deletion
        },
        error: (error) => {
          this.deleteMessage = `Error deleting user: ${error.message}`;
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  // Method to retrieve email from user attributes
  getEmail(user: any): string {
    const emailAttr = user.Attributes.find((attr: UserAttribute) => attr.Name === 'email');
    return emailAttr ? emailAttr.Value : '';
  }
  // Custom validator to check if passwords match
  passwordsMatchValidator(formGroup: FormGroup): null | { passwordsMismatch: true } {
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
          this.signupForm.reset();
          this.fetchEmployeeList(); // Refresh employee list after adding a user
        },
        error: (err) => {
          this.userAddedMessage = 'Error adding user: ' + err.message;
        }
      });
    }
  }
}
