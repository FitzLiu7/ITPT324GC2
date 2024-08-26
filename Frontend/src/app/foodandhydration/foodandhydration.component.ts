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
  RoomNumber: string;
  Stage: string;
}

@Component({
  selector: 'app-foodandhydration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './foodandhydration.component.html',
  styleUrls: ['./foodandhydration.component.css'],
})
export class FoodandhydrationComponent implements OnInit {
  allRooms: Room[] = [
    {
      RoomNumber: 'N1',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: 'N2',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '1',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '3',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '4',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '8',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '9',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '10',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '11',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '12',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '13',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '14',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
    {
      RoomNumber: '15',
      Date: '',
      Stock: 0,
      Week: 0,
      FoodType: '',
      Tubs: '',
      WaterType: '',
      Stage: '',
    },
  ];

  rooms: Room[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getList().subscribe(
      (initialData) => {
        console.log('Initial data:', initialData);
        this.rooms = this.processRoomsData(initialData);
      },
      (error) => {
        console.error('Error fetching initial data:', error);
      }
    );

    this.apiService.getDataUpdates().subscribe(
      (data) => {
        console.log('Updated data:', data);
        this.rooms = this.processRoomsData(data);
      },
      (error) => {
        console.error('Error receiving WebSocket data:', error);
      }
    );
  }

  private processRoomsData(rooms: Room[]): Room[] {
    return rooms.map((room) => ({
      ...room,
      Stage: this.calculateStage(room.Date),
    }));
  }

  private calculateStage(stockDate: string): string {
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
