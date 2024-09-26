import {Component, OnInit} from '@angular/core';
import { ApiService } from '../api.service';
import {NgForOf} from "@angular/common";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-stafftracking',
  standalone: true,
  imports: [
    NgForOf,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './stafftracking.component.html',
  styleUrl: './stafftracking.component.css'
})

export class StafftrackingComponent implements OnInit {
  employeeList: Array<any> = [];
  signupForm: FormGroup;
  userAddedMessage: string = '';

  constructor(private apiService: ApiService, private fb: FormBuilder, private router: Router) {
    // Initialize the signup form with validation rules
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.apiService.getUserList().subscribe(
      (data) => {
        this.employeeList = data.Users;
        console.log('employeeList data:', data);
        this.apiService.getStaffTaskList().subscribe(
          (res) => {
            this.employeeList.forEach((e, index) => {
              for (let i = 0; i < res.length; i++) {
                if (e.Username === res[i].userName) {
                  this.employeeList[index] = Object.assign(e, res[i]);
                }
              }
            });
            console.log('employeeList data:', this.employeeList);
          },
          (error) => {
            console.log(error);
          }
        );
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
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
