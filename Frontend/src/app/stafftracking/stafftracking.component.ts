import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { NgForOf, NgClass, CommonModule } from '@angular/common';

@Component({
  selector: 'app-stafftracking',
  standalone: true,
  imports: [NgForOf, NgClass, CommonModule],
  templateUrl: './stafftracking.component.html',
  styleUrls: ['./stafftracking.component.css'],
})
export class StafftrackingComponent implements OnInit {
  employeeList: Array<any> = [];

  constructor(private apiService: ApiService) {}

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
            this.employeeList.forEach((employee, index) => {
              // Find the task data for the corresponding employee
              const taskData = res.find(
                (task: any) => task.userName === employee.Username
              );

              if (taskData) {
                this.employeeList[index] = {
                  ...employee,
                  status: taskData.working ? 'working' : 'Idle',
                  startTime: taskData.startTime
                    ? new Date(taskData.startTime).toLocaleTimeString()
                    : '--',
                  // Make sure that `endTime` is only shown when `working` is false
                  endTime:
                    !taskData.working && taskData.endTime
                      ? new Date(taskData.endTime).toLocaleTimeString()
                      : '--',
                  task: taskData.task || '--',
                  roomNumber: taskData.roomNumber || '--',
                };
              }
            });

            console.log(
              'Updated employeeList data with task information:',
              this.employeeList
            );
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
