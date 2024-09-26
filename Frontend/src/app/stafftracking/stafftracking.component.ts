import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { NgForOf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-stafftracking',
  standalone: true,
  imports: [NgForOf, CommonModule, ReactiveFormsModule],
  templateUrl: './stafftracking.component.html',
  styleUrls: ['./stafftracking.component.css'],
})
export class StafftrackingComponent implements OnInit {
  employeeList: Array<any> = [];
  signupForm: FormGroup;
  userAddedMessage: string = '';

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Initialize the signup form with validation rules
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    // Fetch the user list
    this.apiService.getUserList().subscribe(
      (data) => {
        // Initialize the employee list with the fetched data
        this.employeeList = data.Users.map((user: any) => ({
          ...user,
          status: 'Idle', // Set initial status as Idle
          startTime: '--', // Set initial startTime as '--'
          endTime: '--', // Set initial endTime as '--'
          task: '--', // Set initial task as '--'
          roomNumber: '--', // Set initial roomNumber as '--'
        }));

        console.log('Initial employeeList data:', this.employeeList);

        // Fetch the staff task list
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
            console.error('Error fetching staff task list:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
  }
}
