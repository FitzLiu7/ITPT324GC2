import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';

interface Room {
  Date: string;
  Stock: number;
  Week: number;
  FoodType: string;
  Tubs: string;
  WaterType: string;
  RoomNumber: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export default class DashboardComponent implements OnInit {
  rooms: Room[] = [];

  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    // Fetch initial data from HTTP request
    this.apiService.getList().subscribe(
      (initialData) => {
        console.log('Initial data:', initialData);
        this.rooms = initialData; // Initialize rooms with HTTP data
      },
      (error) => {
        console.error('Error fetching initial data:', error);
      }
    );
  
    // Subscribe to the WebSocket updates
    this.apiService.getDataUpdates().subscribe(
      (data) => {
        console.log('Updated data:', data);
        this.rooms = data; // Update rooms with WebSocket data
      },
      (error) => {
        console.error('Error receiving WebSocket data:', error);
      }
    );
  }
  
}
