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
  rooms: any = ['N1', 'N2', 1, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15]; // List of room labels/numbers
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
    this.rooms = this.rooms.map((roomName: any) => {
      return {
        name: roomName,
        roomNumber:
          roomName === 'N1' ? 1001 : roomName === 'N2' ? 1002 : roomName,
        food: null,
        water: null,
      };
    });

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
          // Reset food and water entries in each room
          this.rooms.forEach((room: any) => {
              room.food = null;  // Clear food tasks
              room.water = null; // Clear water tasks
          });

          // Update employee list based on the response
          this.employeeList.forEach((e, index) => {
              for (let i = 0; i < res.length; i++) {
                  // Check if the userName matches either the old format or the new unique identifier format
                  if (e.Username === res[i].userName || e.Username === res[i].userName.split('_')[0]) {
                      // Convert startTime and endTime to Date objects
                      const startTime = res[i].startTime ? new Date(res[i].startTime) : null;
                      const endTime = res[i].endTime ? new Date(res[i].endTime) : null;

                      // Update employee details with task information
                      this.employeeList[index] = {
                          ...e,
                          status: startTime && !endTime ? 'Working' : 'Idle',
                          startTime: startTime ? startTime.toLocaleTimeString() : '--',
                          endTime: endTime ? endTime.toLocaleTimeString() : '--',
                          task: res[i].task || '--',
                          roomNumber: res[i].roomNumber && res[i].roomNumber !== '--' ? res[i].roomNumber : 9999,
                          elapsedTime: startTime ? this.calculateElapsedTime(startTime, endTime || new Date()) : '--',
                      };

                      // Start counting elapsed time if startTime exists and endTime is not yet available
                      if (startTime && !endTime) {
                          this.startElapsedTime(index, startTime);
                      } else if (endTime) {
                          this.stopElapsedTime(index); // Stop the interval when endTime is received
                      }

                      // Map data to the rooms
                      this.rooms.forEach((room: any) => {
                          if (room.roomNumber === this.employeeList[index].roomNumber) {
                              if (this.employeeList[index].task === 'Food') {
                                  room.food = this.employeeList[index];
                              }
                              if (this.employeeList[index].task === 'Water') {
                                  room.water = this.employeeList[index];
                              }
                          }
                      });
                  }
              }
          });
      },
      (error) => {
          console.error('Error loading staff tasks:', error);
      }
  );
}

// Method to clear all tasks from the database and refresh the UI
clearAllTasks() {
  // Prompt the user for confirmation
  if (confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
    this.apiService.clearAllTasks().subscribe(
      (response) => {
        // Extract the message from the response and show it to the user
        const message = response.message || 'Tasks cleared successfully.';
        alert(message); // Display the message in an alert or use any preferred method to show messages
        this.refreshPage(); // Refresh the page or data if necessary
      },
      (error) => {
        console.error('Error clearing tasks:', error);
        alert('Failed to clear tasks. Please try again.');
      }
    );
  }
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
    this.rooms.forEach((room: any) => {
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
