import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service'; // Importing the service to get data
import { FloatingButtonComponent } from '../floating-button/floating-button.component'; // Importing a floating button component

// Defining the structure of a Room object
interface Room {
  Date?: string;
  Stock?: number | null; // Allow Stock to be null
  Week?: number | null; // Allow Week to be null
  FoodType?: string | null; // Allow FoodType to be null
  Tubs?: string | null; // Allow Tubs to be null
  WaterType?: string | null; // Allow WaterType to be null
  RoomNumber: number | string;
  Stage?: string | null; // Allow Stage to be null
  subRooms?: Room[];
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
    141,
    142,
    143,
    15,
    151,
    152,
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
    this.rooms = this.fixedRooms
      .filter(
        (roomNumber) =>
          ![141, 142, 143, 151, 152].includes(roomNumber as number)
      )
      .map((roomNumber) => {
        // Map N1 and N2 to numeric equivalents to match backend data
        const mappedRoomNumber =
          roomNumber === 'N1' ? 1001 : roomNumber === 'N2' ? 1002 : roomNumber;

        // Find the room data if it exists in the incoming data
        const existingRoom = data.find(
          (room) => room.RoomNumber === mappedRoomNumber
        );

        // Check if the room should display sub-rooms
        if (roomNumber === 14 || roomNumber === 15) {
          // Find sub-rooms
          const subRooms = data
            .filter((room) =>
              roomNumber === 14
                ? [14, 141, 142, 143].includes(room.RoomNumber as number)
                : [15, 151, 152].includes(room.RoomNumber as number)
            )
            .map((subRoom) => ({
              ...subRoom,
              Stage: this.calculateStage(subRoom.Date), // Apply calculateStage to each sub-room
            }));

          // Return a room with subRooms included
          return {
            RoomNumber: roomNumber,
            subRooms,
            Week: existingRoom?.Week ?? 0, // Use 0 as default
            Stage: this.calculateStage(existingRoom?.Date),
            Stock: existingRoom?.Stock ?? 0, // Use 0 as default
          };
        }

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
  private calculateStage(stockDate?: string | null): string {
    if (!stockDate) return 'Empty'; // Return 'Not Available' if no date is provided

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

  // Private function to calculate the number of days between two dates
  private getDaysDifference(startDate: Date, currentDate: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24; // Number of milliseconds in a day
    return Math.floor((currentDate.getTime() - startDate.getTime()) / msPerDay); // Calculate the difference in days
  }
}
