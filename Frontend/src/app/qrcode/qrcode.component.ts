import { Component, OnInit, OnDestroy } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MinutesSecondsPipe } from '../minutes-seconds.pipe';
import { getCurrentUser } from 'aws-amplify/auth';
import { log } from '@angular-devkit/build-angular/src/builders/ssr-dev-server';

interface StaffTask {
  userName: string;
  roomNumber: number;
  startTime: number;
  endTime?: number;
  task: string;
  working: boolean;
  elapsedTime?: number;
}

@Component({
  selector: 'app-qrcode',
  standalone: true,
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.css'],
  imports: [CommonModule, ZXingScannerModule, MinutesSecondsPipe],
})
export class QRcodeComponent implements OnInit, OnDestroy {
  isScannerOpen = true; // Indicates if the scanner is active
  roomData: any = null; // Holds room data after a successful scan
  scannerResult: string | null = null; // Result from the QR code scan
  scanSuccess = false; // Indicates a successful scan
  scanError = false; // Indicates if there was an error scanning
  scanErrorMessage = ''; // Holds the error message in case of a scan failure
  userName: string = ''; // Stores the authenticated user's name
  foodTimer: any = null; // Interval reference for the food timer
  waterTimer: any = null; // Interval reference for the water timer
  foodStartTime: Date | null = null; // Start time for the food task
  waterStartTime: Date | null = null; // Start time for the water task
  waterEndTime: Date | null = null; // End time for the water task
  foodEndTime: Date | null = null; // End time for the food task
  foodElapsedTime: number = 0; // Tracks the elapsed time for the food task
  waterElapsedTime: number = 0; // Tracks the elapsed time for the water task
  isFoodTimerRunning = false; // Indicates if the food timer is running
  isWaterTimerRunning = false; // Indicates if the water timer is running
  status: string = 'Vacant'; // Current status display
  taskList: StaffTask[] = []; // List of tasks retrieved from the backend
  currentUserTask: StaffTask | null = null; // The current task for the logged-in user
  currentRoomNumber: number = 0; // Stores the currently scanned room number

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.currentAuthenticatedUser();
    // Retrieve the list of staff tasks when component is initialized
    this.apiService.getStaffTaskList().subscribe(
      (res: StaffTask[]) => {
        this.taskList = res.map((task) => ({
          ...task,
          elapsedTime: task.endTime ? task.endTime - task.startTime : 0,
        }));
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ngOnDestroy() {
    // Clear timers when the component is destroyed
    if (this.foodTimer) clearInterval(this.foodTimer);
    if (this.waterTimer) clearInterval(this.waterTimer);
  }

  // Retrieve the currently authenticated user
  async currentAuthenticatedUser() {
    try {
      const { username } = await getCurrentUser();
      this.userName = username;
    } catch (err) {
      console.log(err);
    }
  }

  // Open QR scanner and reset necessary data
  openQrScanner() {
    this.isScannerOpen = true;
    this.roomData = null;
    this.scanSuccess = false;
    this.scanError = false;
    this.scanErrorMessage = '';
    this.resetTimers();
  }

  // Handle the QR code scan result
  onCodeResult(resultString: string) {
    this.scannerResult = resultString.trim();
    console.log('Scanned QR:', resultString);

    this.scanError = false;
    this.scanSuccess = false;
    let roomNumber: any;

    if (new RegExp(/^ITPT324GC2\s(\d+|N1|N2)$/).test(this.scannerResult)) {
      roomNumber = this.scannerResult.split(' ').pop();
    } else {
      alert('Error with QR code');
      return;
    }

    roomNumber = this.resolveRoomNumber(roomNumber);

    // Validate if the room number is among the allowed ones
    if (
      ![1001, 1002, 1, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15].includes(
        Number(roomNumber)
      )
    ) {
      this.scanError = true;
      this.scanErrorMessage = 'Invalid QR code';
      return;
    }

    // Fetch room data or sub-room data based on room number
    if (roomNumber === 14 || roomNumber === 15) {
      this.fetchSubRoomData(roomNumber);
    } else {
      this.fetchRoomData(roomNumber);
    }
  }

  // Resolve room number from scan result
  resolveRoomNumber(roomNumber: string): number {
    if (roomNumber === 'N1') return 1001;
    if (roomNumber === 'N2') return 1002;
    return Number(roomNumber);
  }

  // Fetch data for rooms 14 or 15 and their sub-rooms
  fetchSubRoomData(mainRoomNumber: number) {
    // Define sub-room numbers for room 14 and 15
    const subRoomNumbers =
      mainRoomNumber === 14
        ? [14, 141, 142, 143]
        : mainRoomNumber === 15
        ? [15, 151]
        : [];

    // Create an array of promises to fetch data for each sub-room
    const roomRequests = subRoomNumbers.map((subRoomNum) =>
      this.apiService.getRoomData(subRoomNum).toPromise()
    );

    // Use Promise.all to wait for all room data to be fetched
    Promise.all(roomRequests)
      .then((allRoomsData) => {
        // Populate the roomData object with room and sub-room data
        this.roomData = {
          RoomNumber: mainRoomNumber,
          subRooms: allRoomsData.map((room) => ({
            ...room,
            Stage: this.calculateStage(room.Date), // Custom logic to calculate stage
            Scoops: this.calculateScoops(room.Date), // Custom logic for scoops
            Bottles: this.calculateBottles(room.Date), // Custom logic for bottles
          })),
        };

        // Reset timers for the rooms and indicate a successful scan
        this.resetTimers();
        this.scanSuccess = true;
        this.isScannerOpen = false;
      })
      .catch((error) => {
        // Handle errors when fetching room data
        console.error('Error fetching room data:', error);
        this.scanError = true;
        this.scanErrorMessage = 'Error fetching room data. Please try again.';
      });
  }

  // Fetch data for a single room
  fetchRoomData(roomNumber: number) {
    this.apiService.getRoomData(roomNumber).subscribe(
      (data) => {
        if (!data) {
          this.scanError = true;
          this.scanErrorMessage = 'Room not found in the database';
          return;
        }

        this.currentRoomNumber = roomNumber;

        // Populate data for the room
        this.roomData = {
          ...data,
          Stage: this.calculateStage(data.Date),
          Scoops: this.calculateScoops(data.Date),
          Bottles: this.calculateBottles(data.Date),
        };

        this.resetTimers();
        this.currentUserTask =
          this.taskList.find((task) => task.userName === this.userName) || null;

        if (this.currentUserTask) {
          if (this.currentUserTask.working) {
            this.status = 'Occupied';
            if (this.currentUserTask.task === 'Food') {
              this.isFoodTimerRunning = true;
              this.foodStartTime = new Date(this.currentUserTask.startTime);
              this.foodTimer = setInterval(() => {
                this.foodElapsedTime = Math.floor(
                  (Date.now() - this.foodStartTime!.getTime()) / 1000
                );
              }, 1000);
            }

            if (this.currentUserTask.task === 'Water') {
              this.isWaterTimerRunning = true;
              this.waterStartTime = new Date(this.currentUserTask.startTime);
              this.waterTimer = setInterval(() => {
                this.waterElapsedTime = Math.floor(
                  (Date.now() - this.waterStartTime!.getTime()) / 1000
                );
              }, 1000);
            }
          }
        }

        this.scanSuccess = true;
        this.isScannerOpen = false;
      },
      (error) => {
        console.error('Error fetching room data:', error);
        this.scanError = true;
        this.scanErrorMessage = 'Error fetching room data';
      }
    );
  }

  // Reset timer-related variables
  resetTimers() {
    if (this.foodTimer) {
      clearInterval(this.foodTimer);
      this.foodTimer = null;
    }
    if (this.waterTimer) {
      clearInterval(this.waterTimer);
      this.waterTimer = null;
    }
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

  // Toggle the food timer on or off
  toggleFoodTimer() {
    if (this.isFoodTimerRunning) {
      if (!this.currentUserTask) {
        console.error('No active task found.');
        return;
      }

      if (!confirm('Are you sure you want to end the Food task?')) return;

      const params = {
        ...this.currentUserTask,
        task: 'Food',
        working: false,
        endTime: Date.now(),
      };

      this.apiService.updateStaffTask(params).subscribe(
        () => {
          clearInterval(this.foodTimer);
          this.foodEndTime = new Date();
          this.isFoodTimerRunning = false;
          this.updateStatus();
        },
        (error) => {
          console.error('Failed to update staff task:', error);
          alert('Error stopping the timer. Please try again.');
        }
      );
    } else {
      if (this.isWaterTimerRunning) return;
      if (!confirm('Are you sure you want to start the Food task?')) return;

      const params: StaffTask = {
        userName: this.userName,
        startTime: Date.now(),
        task: 'Food',
        working: true,
        roomNumber: this.currentRoomNumber,
      };

      this.currentUserTask = params;

      this.apiService.addStaffTask(params).subscribe(
        () => {
          this.startFoodTimer();
        },
        (error) => {
          console.error('Failed to add staff task:', error);
        }
      );
    }
  }

  // Start the food timer and update its elapsed time
  startFoodTimer() {
    this.foodStartTime = new Date();
    this.foodEndTime = null;
    this.foodElapsedTime = 0;
    this.isFoodTimerRunning = true;
    this.foodTimer = setInterval(() => {
      this.foodElapsedTime = Math.floor(
        (Date.now() - this.foodStartTime!.getTime()) / 1000
      );
    }, 1000);
    this.updateStatus();
  }

  // Toggle the water timer on or off
  toggleWaterTimer() {
    if (this.isWaterTimerRunning) {
      if (!this.currentUserTask) {
        console.error('No active task found.');
        return;
      }

      if (!confirm('Are you sure you want to end the Water task?')) return;

      const params = {
        ...this.currentUserTask,
        task: 'Water',
        working: false,
        endTime: Date.now(),
      };

      this.apiService.updateStaffTask(params).subscribe(
        () => {
          clearInterval(this.waterTimer);
          this.waterEndTime = new Date();
          this.isWaterTimerRunning = false;
          this.updateStatus();
        },
        (error) => {
          console.error('Failed to update staff task:', error);
          alert('Error stopping the timer. Please try again.');
        }
      );
    } else {
      if (this.isFoodTimerRunning) return;
      if (!confirm('Are you sure you want to start the Water task?')) return;

      const params: StaffTask = {
        userName: this.userName,
        startTime: Date.now(),
        task: 'Water',
        working: true,
        roomNumber: this.currentRoomNumber,
      };

      this.currentUserTask = params;

      this.apiService.addStaffTask(params).subscribe(
        () => {
          this.startWaterTimer();
        },
        (error) => {
          console.error('Failed to add staff task:', error);
        }
      );
    }
  }

  // Start the water timer and update its elapsed time
  startWaterTimer() {
    this.waterStartTime = new Date();
    this.waterEndTime = null;
    this.waterElapsedTime = 0;
    this.isWaterTimerRunning = true;
    this.waterTimer = setInterval(() => {
      this.waterElapsedTime = Math.floor(
        (Date.now() - this.waterStartTime!.getTime()) / 1000
      );
    }, 1000);
    this.updateStatus();
  }

  // Update the status based on the current task
  updateStatus() {
    if (this.isFoodTimerRunning) {
      this.status = 'Occupied';
    } else if (this.isWaterTimerRunning) {
      this.status = 'Occupied';
    } else {
      this.status = 'Vacant';
    }
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
    if (daysDiff < 7) return '1/2 ';
    else if (daysDiff < 14) return '1 ';
    else if (daysDiff < 21) return '1-1/2 ';
    else if (daysDiff < 28) return '2 ';
    else if (daysDiff < 43) return '2-1/2 ';
    else if (daysDiff < 45) return '1/2 ';
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
  goBack(): void {
    this.router.navigate(['/fyh']);
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}m ${seconds}s`;
  }

  private getDaysDifference(startDate: Date, currentDate: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((currentDate.getTime() - startDate.getTime()) / msPerDay);
  }
}
