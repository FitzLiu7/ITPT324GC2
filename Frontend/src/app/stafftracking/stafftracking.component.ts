<<<<<<< Updated upstream
import {Component, OnInit} from '@angular/core';
import { ApiService } from '../api.service';
import {NgForOf} from "@angular/common";
=======
import { Component, OnInit } from '@angular/core';
import { DataSharingService } from '../services/data-sharing.service';
import { CommonModule } from '@angular/common';
import { MinutesSecondsPipe } from '../minutes-seconds.pipe';
>>>>>>> Stashed changes

@Component({
  selector: 'app-stafftracking',
  standalone: true,
<<<<<<< Updated upstream
  imports: [
    NgForOf
  ],
=======
  imports: [CommonModule, MinutesSecondsPipe],
>>>>>>> Stashed changes
  templateUrl: './stafftracking.component.html',
  styleUrls: ['./stafftracking.component.css'],
})
<<<<<<< Updated upstream


export class StafftrackingComponent implements OnInit {
  employeeList: Array<any> = [];

  constructor(private apiService: ApiService) {

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
                if (e.Username == res[i].userName) {
                  this.employeeList[index] = Object.assign(e, res[i])
                }
              }
            })
            console.log('employeeList data:', this.employeeList);
          },
          (error) => {
            console.log(error);
          }
        )

      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    )
=======
export class StafftrackingComponent implements OnInit {
  staffData: any[] = []; // Array to store the dynamic staff data

  constructor(private dataSharingService: DataSharingService) {}

  ngOnInit(): void {
    // Subscribe to the data from DataSharingService
    this.dataSharingService.currentScannedData.subscribe((data) => {
      console.log('Received data in StafftrackingComponent:', data); // Debug log to confirm data reception
      if (data) {
        const existingIndex = this.staffData.findIndex(
          (user) => user.username === data.username
        );
        if (existingIndex > -1) {
          this.staffData[existingIndex] = data; // Update existing data
        } else {
          this.staffData.push(data); // Add new data entry
        }
        console.log('Updated staffData array:', this.staffData); // Debug log to verify the staffData array
      }
    });
>>>>>>> Stashed changes
  }
}
