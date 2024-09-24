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
    15,
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

    // Subscribe to WebSocket updates
    this.apiService.getDataUpdates().subscribe(
      (updatedData) => {
        console.log('WebSocket Data received:', updatedData);
        this.populateRooms(updatedData); // Update the rooms when WebSocket data is received
      },
      (error) => {
        console.error('Error receiving WebSocket data:', error);
      }
    );
  }

  // Function to fill in room data, ensuring all fixed rooms are represented
  populateRooms(data: Room[]) {
    this.rooms = this.fixedRooms.map((roomNumber) => {
      // Map N1 and N2 to numeric equivalents to match backend data
      const mappedRoomNumber =
        roomNumber === 'N1' ? 1001 : roomNumber === 'N2' ? 1002 : roomNumber;

      // Find the room data if it exists in the incoming data
      const existingRoom = data.find(
        (room) => room.RoomNumber === mappedRoomNumber
      );

      // Return the room data or a default room object
      return existingRoom
        ? {
            ...existingRoom,
            RoomNumber: roomNumber,
            Stage: this.calculateStage(existingRoom.Date),
          }
        : { RoomNumber: roomNumber, Stock: 0, Week: 0, Stage: '-' };
    });
  }

  // Private function to calculate the stage of the room based on the stock date
  private calculateStage(stockDate?: string): string {
    if (!stockDate) return 'Unknown'; // Return 'Unknown' if no date is provided

    const startDate = new Date(stockDate); // Convert stockDate to a Date object
    const currentDate = new Date(); // Get the current date
    const daysDiff = this.getDaysDifference(startDate, currentDate); // Calculate the difference in days

    // Determine the stage based on the days difference
    if (daysDiff < 2) return 'Babies';
    else if (daysDiff < 7) return 'Extra Small';
    else if (daysDiff < 14) return 'Small';
    else if (daysDiff < 28) return 'Medium';
    else if (daysDiff < 35) return 'Large';
    else if (daysDiff < 42) return 'Breeders';
    else if (daysDiff < 49) return 'Eggpots';
    else return '-----'; // Return a placeholder if it doesn't match any stage
  }

  // Private function to calculate the number of days between two dates
  private getDaysDifference(startDate: Date, currentDate: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24; // Number of milliseconds in a day
    return Math.floor((currentDate.getTime() - startDate.getTime()) / msPerDay); // Calculate the difference in days
  }
}
