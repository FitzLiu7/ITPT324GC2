import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';

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
  selector: 'app-foodandhydration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './foodandhydration.component.html',
  styleUrls: ['./foodandhydration.component.css'],
})
export class FoodandhydrationComponent implements OnInit {
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
    15,
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
        ? { ...existingRoom, Stage: this.calculateStage(existingRoom.Date) }
        : {
            RoomNumber: roomNumber,
            Stock: 0,
            Week: 0,
            Stage: 'Unknown',
            FoodType: '',
            WaterType: '',
          };
    });
  }

  private calculateStage(stockDate?: string): string {
    if (!stockDate) return 'Unknown';

    const startDate = new Date(stockDate);
    const currentDate = new Date();
    const weeksDiff = this.getWeeksDifference(startDate, currentDate);

    if (weeksDiff < 1) return 'Babies';
    else if (weeksDiff < 2) return 'Extra Small';
    else if (weeksDiff < 4) return 'Small';
    else if (weeksDiff < 6) return 'Medium';
    else if (weeksDiff < 7) return 'Large';
    else return 'Breeders';
  }

  private getWeeksDifference(startDate: Date, currentDate: Date): number {
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(
      (currentDate.getTime() - startDate.getTime()) / msPerWeek
    );
  }
}
