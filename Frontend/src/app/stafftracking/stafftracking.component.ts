import {Component, OnInit} from '@angular/core';
import { ApiService } from '../api.service';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-stafftracking',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './stafftracking.component.html',
  styleUrl: './stafftracking.component.css'
})


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
  }
}
