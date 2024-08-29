import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service'; // Importing the service to get data
import { FloatingButtonComponent } from '../floating-button/floating-button.component'; // Importing a floating button component

// Defining the structure of a Room object
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
  rooms: Room[] = []; // Array to hold room data
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
  ]; // List of fixed room numbers to display

  constructor(private apiService: ApiService) {} // Injecting the ApiService

  ngOnInit() {
    // Fetch initial data when the component loads
    this.apiService.getList().subscribe(
      (initialData) => {
        console.log('Initial data:', initialData);
        this.populateRooms(initialData); // Populate the rooms with initial data
      },
      (error) => {
        console.error('Error fetching initial data:', error);
      }
    );

    // Subscribe to real-time updates via WebSocket
    this.apiService.getDataUpdates().subscribe(
      (data) => {
        console.log('Updated data:', data);
        this.populateRooms(data); // Update rooms when new data arrives
      },
      (error) => {
        console.error('Error receiving WebSocket data:', error);
      }
    );
  }

  // Function to fill in room data, ensuring all fixed rooms are represented
  populateRooms(data: Room[]) {
    this.rooms = this.fixedRooms.map((roomNumber) => {
      // Find the room data if it exists in the incoming data
      const existingRoom = data.find((room) => room.RoomNumber === roomNumber);
      // If room data exists, use it; otherwise, create a default entry
      return existingRoom
        ? existingRoom
        : { RoomNumber: roomNumber, Stock: 0, Week: 0, Stage: '-' };
    });
  }
}
