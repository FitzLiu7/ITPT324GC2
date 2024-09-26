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
  rooms = ['N1', 'N2', 1, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15];
  roomTasks: any = {}; // Almacenará las tareas completadas por cada room
  employeeList: Array<any> = [];
  signupForm: FormGroup;
  userAddedMessage: string = '';

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.apiService.getUserList().subscribe(
      (data) => {
        this.employeeList = data.Users.map((user: any) => ({
          ...user,
          status: 'Idle',
          startTime: '--',
          endTime: '--',
          task: '--',
          roomNumber: '--',
        }));

        this.apiService.getStaffTaskList().subscribe(
          (res) => {
            this.employeeList.forEach((e, index) => {
              for (let i = 0; i < res.length; i++) {
                if (e.Username === res[i].userName) {
                  this.employeeList[index] = Object.assign(e, res[i]);
                }
              }
            });

            this.loadRoomTasks();
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

  // Método para cargar las tareas completadas por salón
  loadRoomTasks() {
    this.rooms.forEach((room) => {
      this.roomTasks[room] = { FOOD: false, WATER: false, completed: false };
      this.employeeList.forEach((employee) => {
        if (employee.roomNumber == room && employee.task === 'food') {
          this.roomTasks[room].FOOD = true;
        }
        if (employee.roomNumber == room && employee.task === 'water') {
          this.roomTasks[room].WATER = true;
        }
      });
      if (this.roomTasks[room].FOOD && this.roomTasks[room].WATER) {
        this.roomTasks[room].completed = true;
      }
    });
    console.log('Room tasks loaded:', this.roomTasks);
  }

  isTaskCompleted(room: string | number, task: string): boolean {
    return this.roomTasks[room]?.[task];
  }

  isRoomCompleted(room: string | number): boolean {
    return this.roomTasks[room]?.completed;
  }
}
