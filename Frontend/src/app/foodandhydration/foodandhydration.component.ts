import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service'; // Importing the ApiService to fetch data
import { QrFloatingButtonComponent } from '../qr-floating-button/qr-floating-button.component'; // Importing the QR floating button component

// Interface representing a room's data structure
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
  selector: 'app-foodandhydration', // Selector for using this component in templates
  standalone: true, // Indicates the component can be used independently
  imports: [CommonModule, QrFloatingButtonComponent], // Importing CommonModule and the QR button component
  templateUrl: './foodandhydration.component.html', // Path to the HTML template
  styleUrls: ['./foodandhydration.component.css'], // Path to the CSS file
})
export class FoodandhydrationComponent implements OnInit {
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
  ]; // List of room numbers that should always be displayed

  constructor(private apiService: ApiService) {} // Injecting the ApiService

  ngOnInit() {
    // Fetch initial data from the API when the component loads
    this.apiService.getList().subscribe(
      (initialData) => {
        console.log('Initial data:', initialData);
        this.populateRooms(initialData); // Populate rooms with the fetched data
      },
      (error) => {
        console.error('Error fetching initial data:', error); // Log any errors
      }
    );

    // Subscribe to WebSocket updates for real-time data
    this.apiService.getDataUpdates().subscribe(
      (data) => {
        console.log('Updated data:', data);
        this.populateRooms(data); // Update rooms with the new data
      },
      (error) => {
        console.error('Error receiving WebSocket data:', error); // Log any errors
      }
    );
  }

  // Function to populate rooms, ensuring all fixed rooms are represented
  populateRooms(data: Room[]) {
    this.rooms = this.fixedRooms.map((roomNumber) => {
      // Find if the room already exists in the incoming data
      const existingRoom = data.find((room) => room.RoomNumber === roomNumber);
      return existingRoom
        ? { ...existingRoom, Stage: this.calculateStage(existingRoom.Date) } // Calculate the stage based on the Date
        : {
            RoomNumber: roomNumber,
            Stock: 0,
            Week: 0,
            Stage: '',
            FoodType: '',
            WaterType: '',
          }; // Default values for rooms without data
    });
  }

  // Private function to calculate the stage of the room based on the stock date
  private calculateStage(stockDate?: string): string {
    if (!stockDate) return 'Unknown'; // Return 'Unknown' if no date is provided

    const startDate = new Date(stockDate); // Convert stockDate to a Date object
    const currentDate = new Date(); // Get the current date
    const weeksDiff = this.getWeeksDifference(startDate, currentDate); // Calculate the difference in weeks

    // Determine the stage based on the weeks difference
    if (weeksDiff < 1) return 'Babies';
    else if (weeksDiff < 1) return 'Extra Small';
    else if (weeksDiff < 2) return 'Small';
    else if (weeksDiff < 4) return 'Medium';
    else if (weeksDiff < 6) return 'Large';
    else if (weeksDiff < 7) return 'Breeder';
    else return '-----'; // Return a placeholder if it doesn't match any stage
  }

  // Private function to calculate the number of weeks between two dates
  private getWeeksDifference(startDate: Date, currentDate: Date): number {
    const msPerWeek = 1000 * 60 * 60 * 24 * 7; // Number of milliseconds in a week
    return Math.floor(
      (currentDate.getTime() - startDate.getTime()) / msPerWeek
    ); // Calculate the difference in weeks
  }
}
