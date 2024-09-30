import { Component, OnInit } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MinutesSecondsPipe } from '../minutes-seconds.pipe';
import { getCurrentUser } from 'aws-amplify/auth';

@Component({
  selector: 'app-qrcode',
  standalone: true,
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.css'],
  imports: [CommonModule, ZXingScannerModule, MinutesSecondsPipe],
})
export class QRcodeComponent implements OnInit {
  isScannerOpen = true;
  roomData: any = null;
  scannerResult: string | null = null;
  scanSuccess = false;
  scanError = false;
  scanErrorMessage = '';
  userName: string = '';
  foodTimer: any = null;
  waterTimer: any = null;
  foodStartTime: Date | null = null;
  waterStartTime: Date | null = null;
  waterEndTime: Date | null = null;
  foodEndTime: Date | null = null;
  foodElapsedTime: number = 0;
  waterElapsedTime: number = 0;
  isFoodTimerRunning = false;
  isWaterTimerRunning = false;
  status: string = 'Vacant';
  taskList: Array<any> = [];
  currentUserTask: any = {};
  currentRoomNumber: number = 0;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.currentAuthenticatedUser();
    this.apiService.getStaffTaskList().subscribe(
      (res) => {
        this.taskList = res;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  async currentAuthenticatedUser() {
    try {
      const { username } = await getCurrentUser();
      this.userName = username;
    } catch (err) {
      console.log(err);
    }
  }

  openQrScanner() {
    this.isScannerOpen = true;
    this.roomData = null;
    this.scanSuccess = false;
    this.scanError = false;
    this.scanErrorMessage = '';
    this.resetTimers();
  }

  onCodeResult(resultString: string) {
    this.scannerResult = resultString.trim();
    console.log('Scanned QR:', resultString);

    this.scanError = false;
    this.scanSuccess = false;
    let roomNumber: any;

    if (new RegExp(/^ITPT324GC2\s(\d+|N1|N2)$/).test(this.scannerResult)) {
      roomNumber =
        this.scannerResult.split(' ')[this.scannerResult.split(' ').length - 1];
    } else {
      alert('Error with QR code');
    }

    if (roomNumber === 'N1') {
      roomNumber = 1001;
    } else if (roomNumber === 'N2') {
      roomNumber = 1002;
    }

    if (
      ![1001, 1002, 1, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15].includes(
        Number(roomNumber)
      )
    ) {
      this.scanError = true;
      this.scanErrorMessage = 'Invalid QR code';
      return;
    }

    // Fetch data for room 14 or 15 along with their sub-rooms
    if (roomNumber === 14 || roomNumber === 15) {
      const subRoomNumbers =
        roomNumber === 14 ? [14, 141, 142, 143] : [15, 151, 152];
      let roomRequests = subRoomNumbers.map((subRoomNum) =>
        this.apiService.getRoomData(subRoomNum).toPromise()
      );

      // Fetch data for the main room and all its sub-rooms
      Promise.all(roomRequests)
        .then((allRoomsData) => {
          // Map the data to the same format used in the dashboard component
          this.roomData = {
            RoomNumber: roomNumber,
            subRooms: allRoomsData.map((room) => ({
              ...room,
              Stage: this.calculateStage(room.Date),
              Scoops: this.calculateScoops(room.Date),
              Bottles: this.calculateBottles(room.Date),
            })),
          };

          this.resetTimers();
          this.scanSuccess = true;
          this.isScannerOpen = false;
        })
        .catch((error) => {
          console.error('Error fetching room data:', error);
          this.scanError = true;
          this.scanErrorMessage = 'Error fetching room data';
        });
    } else {
      // Normal room data handling for rooms other than 14 and 15
      this.apiService.getRoomData(roomNumber).subscribe(
        (data) => {
          if (!data) {
            this.scanError = true;
            this.scanErrorMessage = 'Room not found in the database';
            return;
          }
          this.currentRoomNumber = roomNumber;
          this.taskList.forEach((task) => {
            if (this.userName === task.userName) {
              this.currentUserTask = task;
            }
          });

          console.log('Room data:', data);
          this.roomData = data;
          this.roomData.Stage = this.calculateStage(this.roomData.Date);
          this.roomData.Scoops = this.calculateScoops(this.roomData.Date);
          this.roomData.Bottles = this.calculateBottles(this.roomData.Date);

          this.resetTimers();
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
  }

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

  toggleFoodTimer() {
    if (this.isFoodTimerRunning) {
      let params = {
        userName: this.userName,
        startTime: this.currentUserTask.startTime,
        task: 'food',
        working: false,
        roomNumber: this.currentRoomNumber as number,
        endTime: new Date().getTime(), // Ensure endTime is set
      };

      this.apiService.updateStaffTask(params).subscribe(
        () => {
          clearInterval(this.foodTimer);
          this.foodEndTime = new Date(); // Set the endTime as the current date
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

      const params = {
        userName: this.userName,
        startTime: new Date().getTime(),
        task: 'food',
        working: true,
        roomNumber: this.currentRoomNumber as number,
      };
      this.currentUserTask = params;

      if (Object.keys(this.currentUserTask).length > 0) {
        this.apiService.updateStaffTask(params).subscribe(
          () => {
            this.startFoodTimer();
          },
          (error) => {
            console.error('Failed to update staff task:', error);
          }
        );
      } else {
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
  }

  startFoodTimer() {
    this.foodStartTime = new Date();
    this.foodEndTime = null;
    this.foodElapsedTime = 0;
    this.isFoodTimerRunning = true;
    this.foodTimer = setInterval(() => {
      this.foodElapsedTime = Math.floor(
        (new Date().getTime() - this.foodStartTime!.getTime()) / 1000
      );
    }, 1000);
    this.updateStatus();
  }

  toggleWaterTimer() {
    if (this.isWaterTimerRunning) {
      // Set endTime to the current time
      let params = {
        userName: this.userName,
        startTime: this.currentUserTask.startTime,
        task: 'water',
        working: false,
        roomNumber: this.currentRoomNumber as number,
        endTime: new Date().getTime(), // Ensure endTime is set
      };

      this.apiService.updateStaffTask(params).subscribe(
        () => {
          clearInterval(this.waterTimer); // Stop the water timer
          this.waterEndTime = new Date(); // Set the endTime as the current date
          this.isWaterTimerRunning = false;
          this.updateStatus();
        },
        (error) => {
          console.error('Failed to update staff task:', error);
          alert('Error stopping the water timer. Please try again.');
        }
      );
    } else {
      if (this.isFoodTimerRunning) return; // Prevent starting water timer if food timer is running

      // Start the Water timer and add task to the database
      const params = {
        userName: this.userName,
        startTime: new Date().getTime(),
        task: 'water',
        working: true,
        roomNumber: this.currentRoomNumber as number,
      };
      this.currentUserTask = params;

      if (Object.keys(this.currentUserTask).length > 0) {
        this.apiService.updateStaffTask(params).subscribe(
          () => {
            this.startWaterTimer();
          },
          (error) => {
            console.error('Failed to update staff task:', error);
          }
        );
      } else {
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
  }

  startWaterTimer() {
    this.waterStartTime = new Date(); // Set the start time to the current time
    this.waterEndTime = null; // Clear any previous end time
    this.waterElapsedTime = 0; // Reset the elapsed time to zero
    this.isWaterTimerRunning = true; // Set the running status to true

    // Start the interval to update elapsed time every second
    this.waterTimer = setInterval(() => {
      this.waterElapsedTime = Math.floor(
        (new Date().getTime() - this.waterStartTime!.getTime()) / 1000
      );
    }, 1000);

    this.updateStatus(); // Update the status to reflect the change
  }

  updateStatus() {
    this.status =
      this.isFoodTimerRunning || this.isWaterTimerRunning
        ? 'Occupied'
        : 'Vacant';
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  goBack() {
    this.router.navigate(['/fyh']);
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
