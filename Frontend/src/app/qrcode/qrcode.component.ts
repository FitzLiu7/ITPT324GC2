import {Component, OnInit} from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MinutesSecondsPipe } from '../minutes-seconds.pipe';
import {getCurrentUser} from "aws-amplify/auth"; // Import the pipe

@Component({
  selector: 'app-qrcode',
  standalone: true,
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.css'],
  imports: [CommonModule, ZXingScannerModule, MinutesSecondsPipe], // Add the pipe here
})
export class QRcodeComponent implements OnInit {
  isScannerOpen = true; // Controls whether the camera is open
  roomData: any = null; // Scanned room data
  scannerResult: string | null = null;
  scanSuccess = false; // Indicates whether the scan was successful
  scanError = false; // Flag for showing an error message
  scanErrorMessage = ''; // Error message to display
  userName: string = '';
  foodTimer: any = null;
  waterTimer: any = null;
  foodStartTime: Date | null = null;
  waterStartTime: Date | null = null;
  waterEndTime: Date | null = null;
  foodEndTime: Date | null = null;
  foodElapsedTime: number = 0; // Time elapsed in seconds for food
  waterElapsedTime: number = 0; // Time elapsed in seconds for water
  isFoodTimerRunning = false;
  isWaterTimerRunning = false;
  status: string = 'Vacant';
  taskList: Array<any> = [];
  currentUserTask: any  = {};
  currentRoomNumber: number= 0 ;
  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.currentAuthenticatedUser()
    this.apiService.getStaffTaskList().subscribe(
      (res) => {
        this.taskList = res
      },
      (error) => {
        console.log(error);
      }
    )
  }
  // Opens the scanner
  openQrScanner() {
    this.isScannerOpen = true;
    this.roomData = null; // Resets the room data
    this.scanSuccess = false; // Reset the success flag
    this.scanError = false; // Reset error flag
    this.scanErrorMessage = ''; // Clear error message
    this.resetTimers(); // Reset timers when opening scanner
  }

  async currentAuthenticatedUser() {
    try {
      const { username } = await getCurrentUser();
      this.userName = username;
    } catch (err) {
      console.log(err);
    }
  }

  // Handles the result of the scanned QR code
  onCodeResult(resultString: string) {
    this.scannerResult = resultString.trim();
    console.log('Scanned QR:', resultString);

    // Reset error and success states
    this.scanError = false;
    this.scanSuccess = false;
    let roomNumber : any;

    if (new RegExp(/^ITPT324GC2\s(\d+|N1|N2)$/).test(this.scannerResult)){
      debugger
      roomNumber = this.scannerResult.split(' ')[this.scannerResult.split(' ').length-1]
    } else {
      alert('Error of QRcode')
    }

    // Map N1 to 1001 and N2 to 1002
    if (roomNumber === 'N1') {
      roomNumber = 1001;
    } else if (roomNumber === 'N2') {
      roomNumber = 1002;
    }

    if(![1001,1002,1,3,4,8,9,10,11,12,13,14,15].includes(Number(roomNumber))){
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
        this.currentRoomNumber = roomNumber
        this.taskList.forEach((task) => {
          if (this.userName == task.userName) {
            this.currentUserTask = task
            console.log('currentUserTask', this.currentUserTask)
          }
        })

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

  // Resets both timers
  resetTimers() {
    if (this.foodTimer) clearInterval(this.foodTimer);
    if (this.waterTimer) clearInterval(this.waterTimer);
    this.foodStartTime = null;
    this.waterStartTime = null;
    this.foodEndTime = null;
    this.waterEndTime = null;
    this.foodElapsedTime = 0;
    this.waterElapsedTime = 0;
    this.isFoodTimerRunning = false;
    this.isWaterTimerRunning = false;
    this.status = 'Vacant';
  }

  // Start or stop the food timer
  // Start or stop the food timer
  toggleFoodTimer() {

    if (this.isFoodTimerRunning) {

      let params = {
        userName: this.userName,
        startTime: this.currentUserTask.startTime,
        task: 'food',
        working: false,
        roomNumber: this.currentRoomNumber as number,
      }

      this.apiService.updateStaffTask(params).subscribe(
        //
      )

      // Stop the timer and set the end time
      clearInterval(this.foodTimer);
      this.foodEndTime = new Date(); // Set the end time correctly
      this.isFoodTimerRunning = false;
      this.updateStatus();
    } else {
      if (this.isWaterTimerRunning) return; // Prevent starting if water timer is running


      const params = {
        userName: this.userName,
        startTime: new Date().getTime(),
        task: 'food',
        working: true,
        roomNumber: this.currentRoomNumber as number,
      }
      this.currentUserTask = params
      if (Object.keys(this.currentUserTask).length > 0)
        this.apiService.updateStaffTask(params).subscribe(
          // success ...
        )
      } else {
        this.apiService.addStaffTask(params).subscribe(
          // success ...
        )
      }

      this.foodStartTime = new Date(); // Set the start time
      this.foodEndTime = null; // Reset the end time
      this.foodElapsedTime = 0; // Reset elapsed time
      this.isFoodTimerRunning = true;
      this.foodTimer = setInterval(() => {
        this.foodElapsedTime = Math.floor(
          (new Date().getTime() - this.foodStartTime!.getTime()) / 1000
        );
      }, 1000);
      this.updateStatus();
    }
  }

  // Start or stop the water timer
  toggleWaterTimer() {
    if (this.isWaterTimerRunning) {
      // Stop the timer and set the end time
      clearInterval(this.waterTimer);
      this.waterEndTime = new Date(); // Set the end time correctly
      this.isWaterTimerRunning = false;
      this.updateStatus();
    } else {
      if (this.isFoodTimerRunning) return; // Prevent starting if food timer is running
      this.waterStartTime = new Date(); // Set the start time
      this.waterEndTime = null; // Reset the end time
      this.waterElapsedTime = 0; // Reset elapsed time
      this.isWaterTimerRunning = true;
      this.waterTimer = setInterval(() => {
        this.waterElapsedTime = Math.floor(
          (new Date().getTime() - this.waterStartTime!.getTime()) / 1000
        );
      }, 1000);
      this.updateStatus();
    }
  }
  updateStatus() {
    this.status =
      this.isFoodTimerRunning || this.isWaterTimerRunning
        ? 'Occupied'
        : 'Vacant';
  }

  // Helper function to format elapsed time
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
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
