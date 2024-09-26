import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { QrFloatingButtonComponent } from '../qr-floating-button/qr-floating-button.component';
import { AuthService } from '../services/auth/auth.service';

interface Room {
  Date?: string;
  Stock?: number;
  Week?: number;
  Scoops?: string;
  Tubs?: string;
  Bottles?: string;
  RoomNumber: number | string;
  Stage?: string;
  StockType?: string;
}

@Component({
  selector: 'app-foodandhydration',
  standalone: true,
  imports: [CommonModule, QrFloatingButtonComponent],
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

  userRole: string = ''; // Store the user role

  // Map for converting display names to numeric values and vice versa
  roomDisplayNames: { [key: string]: number } = {
    N1: 1001,
    N2: 1002,
  };

  // Map for converting numeric values back to display names
  reverseRoomDisplayNames: { [key: number]: string } = {
    1001: 'N1',
    1002: 'N2',
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get the current user's role
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userRole = currentUser.role;
    }

    if (this.userRole !== 'Staff') {
      // Only load data if not 'Staff'
      this.apiService.getList().subscribe(
        (initialData) => {
          this.populateRooms(initialData);
        },
        (error) => {
          console.error('Error fetching initial data:', error);
        }
      );

      this.apiService.getDataUpdates().subscribe(
        (data) => {
          this.populateRooms(data);
        },
        (error) => {
          console.error('Error receiving WebSocket data:', error);
        }
      );
    }
  }

  populateRooms(data: Room[]) {
    this.rooms = this.fixedRooms.map((roomNumber) => {
      const numericRoomNumber = this.convertRoomNumberToNumeric(roomNumber);
      const existingRoom = data.find(
        (room) => room.RoomNumber === numericRoomNumber
      );
      return existingRoom
        ? {
            ...existingRoom,
            RoomNumber: this.convertNumericToRoomNumber(
              existingRoom.RoomNumber
            ),
            Stage: this.calculateStage(existingRoom.Date),
            Scoops: this.calculateScoops(existingRoom.Date),
            Bottles: this.calculateBottles(existingRoom.Date),
          }
        : {
            RoomNumber: roomNumber,
            Stock: 0,
            Week: 0,
            Stage: '',
            FoodType: '',
            WaterType: '',
          };
    });
  }

  private convertRoomNumberToNumeric(
    roomNumber: number | string
  ): number | undefined {
    if (typeof roomNumber === 'string') {
      return this.roomDisplayNames[roomNumber] ?? undefined;
    }
    return typeof roomNumber === 'number' ? roomNumber : undefined;
  }

  private convertNumericToRoomNumber(
    numericRoomNumber: number | string
  ): number | string {
    if (typeof numericRoomNumber === 'number') {
      return (
        this.reverseRoomDisplayNames[numericRoomNumber] ?? numericRoomNumber
      );
    }
    return numericRoomNumber;
  }

  private calculateStage(stockDate?: string): string {
    if (!stockDate) return 'Unknown'; // Return 'Unknown' if no date is provided

    const startDate = new Date(stockDate); // Convert stockDate to a Date object
    const currentDate = new Date(); // Get the current date
    const daysDiff = this.getDaysDifference(startDate, currentDate); // Calculate the difference in days

    // Determine the stage based on the days difference
    if (daysDiff < 3) return 'Babies';
    else if (daysDiff < 8) return 'Extra Small';
    else if (daysDiff < 14) return 'Small';
    else if (daysDiff < 21) return 'Medium';
    else if (daysDiff < 28) return 'Large';
    else if (daysDiff < 35) return 'Breeders';
    else if (daysDiff < 49) return 'Eggpots';
    else return '-----'; // Return a placeholder if it doesn't match any stage
  }

  private calculateScoops(stockDate?: string): string {
    if (!stockDate) return 'Unknown';
    const startDate = new Date(stockDate);
    const currentDate = this.adjustToNearestFeedingDay(new Date());
    const daysDiff = this.getDaysDifference(startDate, currentDate);
    if (daysDiff < 7) return '1/2 Scoop';
    else if (daysDiff < 14) return '1 Scoop';
    else if (daysDiff < 21) return '1-1/2 Scoops';
    else if (daysDiff < 28) return '2 Scoops';
    else if (daysDiff < 43) return '2-1/2 Scoops';
    else if (daysDiff < 45) return '1/2 Scoop';
    else return 'Unknown';
  }

  private calculateBottles(stockDate?: string): string {
    if (!stockDate) return 'Unknown';
    const startDate = new Date(stockDate);
    const currentDate = this.adjustToNearestFeedingDay(new Date());
    const daysDiff = this.getDaysDifference(startDate, currentDate);
    if (daysDiff < 14) return 'Sponge';
    else if (daysDiff < 21) return '2 Rings';
    else if (daysDiff < 44) return '1 Ring';
    else if (daysDiff < 45) return '1 Ring / 1 Bottle';
    else return 'Unknown';
  }

  private adjustToNearestFeedingDay(date: Date): Date {
    const day = date.getDay();
    if (day === 2) {
      date.setDate(date.getDate() + 1);
    } else if (day === 0 || day === 4 || day === 6) {
      const daysToAdd = (1 + 7 - day) % 7;
      date.setDate(date.getDate() + daysToAdd);
    }
    return date;
  }

  private getDaysDifference(startDate: Date, currentDate: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((currentDate.getTime() - startDate.getTime()) / msPerDay);
  }
}
