import { Component } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MinutesSecondsPipe } from '../minutes-seconds.pipe'; // Import the pipe

@Component({
  selector: 'app-qrcode',
  standalone: true,
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.css'],
  imports: [CommonModule, ZXingScannerModule, MinutesSecondsPipe], // Add the pipe here
})
export class QRcodeComponent {
  isScannerOpen = true; // Controls whether the camera is open
  roomData: any = null; // Scanned room data
  scannerResult: string | null = null;
  scanSuccess = false; // Indicates whether the scan was successful
  scanError = false; // Flag for showing an error message
  scanErrorMessage = ''; // Error message to display

  foodTimer: any = null; // Timer for food
  waterTimer: any = null; // Timer for water
  foodTimeRemaining: number = 0;
  waterTimeRemaining: number = 0;
  isFoodLate: boolean = false;
  isWaterLate: boolean = false;
  isFoodTimerRunning = false; // Controls if the food timer is running
  isWaterTimerRunning = false; // Controls if the water timer is running

  constructor(private apiService: ApiService, private router: Router) {}

  // Opens the scanner
  openQrScanner() {
    this.isScannerOpen = true;
    this.roomData = null; // Resets the room data
    this.scanSuccess = false; // Reset the success flag
    this.scanError = false; // Reset error flag
    this.scanErrorMessage = ''; // Clear error message
    this.resetTimers(); // Reset timers when opening scanner
  }

  // Handles the result of the scanned QR code
  onCodeResult(resultString: string) {
    this.scannerResult = resultString;
    console.log('Scanned QR:', resultString);

    // Reset error and success states
    this.scanError = false;
    this.scanSuccess = false;

    // Map N1 to 1001 and N2 to 1002
    let roomNumber: number;
    if (resultString === 'N1') {
      roomNumber = 1001;
    } else if (resultString === 'N2') {
      roomNumber = 1002;
    } else if (!isNaN(Number(resultString))) {
      roomNumber = Number(resultString);
    } else {
      this.scanError = true;
      this.scanErrorMessage = 'Invalid QR code';
      return;
    }

    // Fetch the room data based on the mapped room number
    this.apiService.getRoomData(roomNumber).subscribe(
      (data) => {
        if (!data) {
          this.scanError = true;
          this.scanErrorMessage = 'Room not found in the database';
          return;
        }

        console.log('Room data:', data);
        this.roomData = data;

        this.roomData.Stage = this.calculateStage(this.roomData.Date);
        this.roomData.Scoops = this.calculateScoops(this.roomData.Date);
        this.roomData.Bottles = this.calculateBottles(this.roomData.Date);

        // Reset timers before allowing a new scan
        this.resetTimers();

        this.scanSuccess = true; // Indicate that the scan was successful
        this.isScannerOpen = false; // Closes the camera after scanning
      },
      (error) => {
        console.error('Error fetching room data:', error);
        this.scanError = true;
        this.scanErrorMessage = 'Error fetching room data';
      }
    );
  }

  // Resets food and water timers
  resetTimers() {
    if (this.foodTimer) clearInterval(this.foodTimer);
    if (this.waterTimer) clearInterval(this.waterTimer);
    this.foodTimeRemaining = 0;
    this.waterTimeRemaining = 0;
    this.isFoodLate = false;
    this.isWaterLate = false;
    this.isFoodTimerRunning = false;
    this.isWaterTimerRunning = false;
  }

  // Starts or stops the food timer
  toggleFoodTimer() {
    if (this.isWaterTimerRunning) return; // Prevent starting both timers
    if (this.isFoodTimerRunning) {
      clearInterval(this.foodTimer); // Stop the timer
      this.isFoodTimerRunning = false;
    } else {
      this.startFoodTimer(); // Start the timer
    }
  }

  // Starts or stops the water timer
  toggleWaterTimer() {
    if (this.isFoodTimerRunning) return; // Prevent starting both timers
    if (this.isWaterTimerRunning) {
      clearInterval(this.waterTimer); // Stop the timer
      this.isWaterTimerRunning = false;
    } else {
      this.startWaterTimer(); // Start the timer
    }
  }

  // Starts food timer logic
  startFoodTimer() {
    const today = new Date();
    const isFriday = today.getDay() === 5;
    const foodTime = isFriday ? 30 * 60 : 20 * 60; // Convert minutes to seconds
    this.foodTimeRemaining = foodTime;
    this.isFoodTimerRunning = true;

    // Timer logic
    this.foodTimer = setInterval(() => {
      this.foodTimeRemaining--;
      if (this.foodTimeRemaining <= 0) {
        this.isFoodLate = true;
        clearInterval(this.foodTimer); // Stop the timer when time runs out
        this.isFoodTimerRunning = false;
      }
    }, 1000);
  }

  // Starts water timer logic
  startWaterTimer() {
    const today = new Date();
    const isFriday = today.getDay() === 5;
    const waterTime = isFriday ? 50 * 60 : 40 * 60; // Convert minutes to seconds
    this.waterTimeRemaining = waterTime;
    this.isWaterTimerRunning = true;

    // Timer logic
    this.waterTimer = setInterval(() => {
      this.waterTimeRemaining--;
      if (this.waterTimeRemaining <= 0) {
        this.isWaterLate = true;
        clearInterval(this.waterTimer); // Stop the timer when time runs out
        this.isWaterTimerRunning = false;
      }
    }, 1000);
  }

  // Go back to the previous page
  goBack() {
    this.router.navigate(['/fyh']);
  }

  // Helper functions to calculate data (unchanged from your original code)
  private calculateStage(stockDate?: string): string {
    if (!stockDate) return 'Unknown';
    const startDate = new Date(stockDate);
    const currentDate = this.adjustToNearestFeedingDay(new Date());
    const daysDiff = this.getDaysDifference(startDate, currentDate);
    if (daysDiff < 2) return 'Babies';
    else if (daysDiff < 7) return 'Extra Small';
    else if (daysDiff < 14) return 'Small';
    else if (daysDiff < 28) return 'Medium';
    else if (daysDiff < 35) return 'Large';
    else if (daysDiff < 42) return 'Breeders';
    else if (daysDiff < 49) return 'Eggpots';
    else return '-----';
  }

  private calculateScoops(stockDate?: string): string {
    if (!stockDate) return 'Unknown';
    const startDate = new Date(stockDate);
    const currentDate = this.adjustToNearestFeedingDay(new Date());
    const daysDiff = this.getDaysDifference(startDate, currentDate);
    if (daysDiff < 8) return '1/2';
    else if (daysDiff < 15) return '1';
    else if (daysDiff < 22) return '1-1/2';
    else if (daysDiff < 29) return '2';
    else if (daysDiff < 40) return '2-1/2';
    else if (daysDiff < 45) return '1/2';
    else return 'Unknown';
  }

  private calculateBottles(stockDate?: string): string {
    if (!stockDate) return 'Unknown';
    const startDate = new Date(stockDate);
    const currentDate = this.adjustToNearestFeedingDay(new Date());
    const daysDiff = this.getDaysDifference(startDate, currentDate);
    if (daysDiff < 14) return 'Sponge';
    else if (daysDiff < 29) return '2 Rings';
    else if (daysDiff < 50) return '1 Ring';
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
