import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { FloatingButtonComponent } from '../floating-button/floating-button.component';

interface Room {
  Date?: string;
  Stock?: number;
  Week?: number;
  FoodType?: string;
  Tubs?: string;
  WaterType?: string;
  RoomNumber: number | string;
  Stage?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FloatingButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export default class DashboardComponent implements OnInit {
  rooms: Room[] = [];
  fixedRooms: (number | string)[] = [
    'N1',
    'N2',
    1,
    3,
    4,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Fetch initial data from HTTP request
    this.apiService.getList().subscribe(
      (initialData) => {
        console.log('Initial data:', initialData);
        this.populateRooms(initialData);
      },
      (error) => {
        console.error('Error fetching initial data:', error);
      }
    );

    // Subscribe to the WebSocket updates
    this.apiService.getDataUpdates().subscribe(
      (data) => {
        console.log('Updated data:', data);
        this.populateRooms(data);
      },
      (error) => {
        console.error('Error receiving WebSocket data:', error);
      }
    );
  }

  populateRooms(data: Room[]) {
    this.rooms = this.fixedRooms.map((roomNumber) => {
      const existingRoom = data.find((room) => room.RoomNumber === roomNumber);
      return existingRoom
        ? existingRoom
        : { RoomNumber: roomNumber, Stock: 0, Week: 0, Stage: '-' };
    });
  }
}
