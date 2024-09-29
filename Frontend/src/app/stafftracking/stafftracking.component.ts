import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class StafftrackingComponent implements OnInit, OnDestroy {
  rooms = ['N1', 'N2', 1, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15]; // List of room labels/numbers
  roomTasks: any = {}; // Stores completed tasks by room
  employeeList: Array<any> = []; // List of employees to be displayed
  signupForm: FormGroup;
  userAddedMessage: string = '';
  intervalIdMap: { [key: number]: any } = {}; // Store interval IDs for each employee

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Initialize the signup form with validation
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    // Fetch initial user data when the component is initialized
    this.apiService.getUserList().subscribe(
      (data) => {
        // Initialize employee list with default values
        this.employeeList = data.Users.map((user: any) => ({
          ...user,
          status: 'Idle',
          startTime: '--',
          endTime: '--',
          task: '--',
          roomNumber: '--',
          elapsedTime: '--',
        }));

        // Subscribe to WebSocket data updates
        this.apiService.getDataUpdates().subscribe(() => {
          this.loadStaffTaskList(); // Refresh task list upon receiving updates
        });

        this.loadStaffTaskList(); // Initial load of the staff task list
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
  }

  // Load the staff task list from the backend
  loadStaffTaskList() {
    this.apiService.getStaffTaskList().subscribe(
      (res) => {
        this.employeeList.forEach((e, index) => {
          for (let i = 0; i < res.length; i++) {
            if (e.Username === res[i].userName) {
              // Convert startTime and endTime to Date objects
              const startTime = res[i].startTime
                ? new Date(res[i].startTime)
                : null;
              const endTime = res[i].endTime ? new Date(res[i].endTime) : null;

              // Update employee details with task information
              this.employeeList[index] = {
                ...e,
                status: res[i].working ? 'Working' : 'Idle',
                startTime: startTime ? startTime.toLocaleTimeString() : '--',
                endTime: endTime ? endTime.toLocaleTimeString() : '--',
                task: res[i].task || '--',
                roomNumber: res[i].roomNumber || '--',
                elapsedTime: startTime
                  ? this.calculateElapsedTime(startTime, endTime || new Date())
                  : '--',
              };

              // Start counting elapsed time if startTime exists and endTime is not yet available
              if (startTime && !endTime) {
                this.startElapsedTime(index, startTime);
              } else if (endTime) {
                this.stopElapsedTime(index); // Stop the interval when endTime is received
              }
            }
          }
        });

        this.loadRoomTasks(); // Load room tasks after updating employee list
      },
      (error) => {
        console.error('Error fetching staff task list:', error);
      }
    );
  }

  // Method to refresh the page
  refreshPage() {
    window.location.reload();
  }

  // Method to start counting elapsed time for an employee
  startElapsedTime(employeeIndex: number, startTime: Date) {
    // Clear any existing interval for this employee
    if (this.intervalIdMap[employeeIndex]) {
      clearInterval(this.intervalIdMap[employeeIndex]);
    }

    // Update elapsed time every second
    this.intervalIdMap[employeeIndex] = setInterval(() => {
      const now = new Date();
      this.employeeList[employeeIndex].elapsedTime = this.calculateElapsedTime(
        startTime,
        now
      );
    }, 1000);
  }

  // Method to stop counting elapsed time for an employee
  stopElapsedTime(employeeIndex: number) {
    if (this.intervalIdMap[employeeIndex]) {
      clearInterval(this.intervalIdMap[employeeIndex]); // Stop the interval
      this.intervalIdMap[employeeIndex] = null; // Clear the stored interval ID
    }
  }

  // Helper method to calculate elapsed time between start and end times
  calculateElapsedTime(startTime: Date, endTime: Date): string {
    const elapsed = (endTime.getTime() - startTime.getTime()) / 1000; // Convert milliseconds to seconds
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  // Load tasks completed by each room
  loadRoomTasks() {
    // Initialize roomTasks for each room with default values
    this.rooms.forEach((room) => {
      this.roomTasks[room] = { FOOD: false, WATER: false, completed: false };
      this.employeeList.forEach((employee) => {
        if (employee.roomNumber == room && employee.task === 'FOOD') {
          this.roomTasks[room].FOOD = true;
        }
        if (employee.roomNumber == room && employee.task === 'WATER') {
          this.roomTasks[room].WATER = true;
        }
      });
      // Set the room as completed if both tasks are done
      if (this.roomTasks[room].FOOD && this.roomTasks[room].WATER) {
        this.roomTasks[room].completed = true;
      }
    });
  }

  // Check if a specific task is completed in a room
  isTaskCompleted(room: string | number, task: string): boolean {
    return this.roomTasks[room]?.[task];
  }

  // Check if both tasks are completed in a room
  isRoomCompleted(room: string | number): boolean {
    return this.roomTasks[room]?.completed;
  }

  ngOnDestroy() {
    // Clear all intervals when the component is destroyed
    for (const key in this.intervalIdMap) {
      if (this.intervalIdMap[key]) {
        clearInterval(this.intervalIdMap[key]);
      }
    }
  }
}
