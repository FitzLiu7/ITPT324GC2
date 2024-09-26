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
        endTime: new Date().getTime(),
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
      clearInterval(this.waterTimer);
      this.waterEndTime = new Date();
      this.isWaterTimerRunning = false;
      this.updateStatus();
    } else {
      if (this.isFoodTimerRunning) return;

      this.waterStartTime = new Date();
      this.waterEndTime = null;
      this.waterElapsedTime = 0;
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
