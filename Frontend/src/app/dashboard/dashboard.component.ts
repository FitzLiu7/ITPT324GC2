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
    // Subscribe to the data updates from the ApiService
    this.apiService.getDataUpdates().subscribe(
      (data) => {
        console.log('Updated data:', data);
        this.rooms = data;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
}
