import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class ConfirmationComponent {
  confirmationForm: FormGroup;
  message: string = '';
  username: string = ''; 

  constructor(
    private fb: FormBuilder,
    private signupService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize the confirmation form
    this.confirmationForm = this.fb.group({
      code: ['', Validators.required],
    });

    // Retrieve the username from the URL query parameter
    this.route.queryParams.subscribe((params) => {
      this.username = params['username'] || '';
    });
  }

  // Method to handle confirmation code submission
  onConfirmCode() {
    if (this.confirmationForm.valid) {
      const code = this.confirmationForm.get('code')?.value;
      this.signupService.confirmSignUp(this.username, code).subscribe(
        (response) => {
          this.message = 'User confirmed successfully.';
          setTimeout(() => this.router.navigate(['/user']), 3000); // Redirect to login page after 3 seconds
        },
        (error) => {
          this.message = `Error: ${error.error.message || 'Confirmation failed'}`;
        }
      );
    }
  }
}
