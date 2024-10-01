import { Component, OnInit, OnDestroy } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MinutesSecondsPipe } from '../minutes-seconds.pipe';
import { getCurrentUser } from 'aws-amplify/auth';

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
  taskList: StaffTask[] = [];
  currentUserTask: StaffTask | null = null;
  currentRoomNumber: number = 0;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.currentAuthenticatedUser();
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
    if (this.foodTimer) clearInterval(this.foodTimer);
    if (this.waterTimer) clearInterval(this.waterTimer);
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
      roomNumber = this.scannerResult.split(' ').pop();
    } else {
      alert('Error with QR code');
      return;
    }

    roomNumber = this.resolveRoomNumber(roomNumber);

    if (![1001, 1002, 1, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15].includes(Number(roomNumber))) {
      this.scanError = true;
      this.scanErrorMessage = 'Invalid QR code';
      return;
    }

    if (roomNumber === 14 || roomNumber === 15) {
      this.fetchSubRoomData(roomNumber);
    } else {
      this.fetchRoomData(roomNumber);
    }
  }

  resolveRoomNumber(roomNumber: string): number {
    if (roomNumber === 'N1') return 1001;
    if (roomNumber === 'N2') return 1002;
    return Number(roomNumber);
  }

  fetchSubRoomData(mainRoomNumber: number) {
    const subRoomNumbers = mainRoomNumber === 14 ? [14, 141, 142, 143] : [15, 151, 152];
    const roomRequests = subRoomNumbers.map((subRoomNum) =>
      this.apiService.getRoomData(subRoomNum).toPromise()
    );

    Promise.all(roomRequests)
      .then((allRoomsData) => {
        this.roomData = {
          RoomNumber: mainRoomNumber,
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
  }

  fetchRoomData(roomNumber: number) {
    this.apiService.getRoomData(roomNumber).subscribe(
      (data) => {
        if (!data) {
          this.scanError = true;
          this.scanErrorMessage = 'Room not found in the database';
          return;
        }

        this.currentRoomNumber = roomNumber;
        this.currentUserTask = this.taskList.find((task) => task.userName === this.userName) || null;

        console.log('Room data:', data);
        this.roomData = {
          ...data,
          Stage: this.calculateStage(data.Date),
          Scoops: this.calculateScoops(data.Date),
          Bottles: this.calculateBottles(data.Date),
        };

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

  startFoodTimer() {
    this.foodStartTime = new Date();
    this.foodEndTime = null;
    this.foodElapsedTime = 0;
    this.isFoodTimerRunning = true;
    this.foodTimer = setInterval(() => {
      this.foodElapsedTime = Math.floor((Date.now() - this.foodStartTime!.getTime()) / 1000);
    }, 1000);
    this.updateStatus();
  }

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

  startWaterTimer() {
    this.waterStartTime = new Date();
    this.waterEndTime = null;
    this.waterElapsedTime = 0;
    this.isWaterTimerRunning = true;
    this.waterTimer = setInterval(() => {
      this.waterElapsedTime = Math.floor((Date.now() - this.waterStartTime!.getTime()) / 1000);
    }, 1000);
    this.updateStatus();
  }

  updateStatus() {
    if (this.isFoodTimerRunning) {
      this.status = 'Food Task';
    } else if (this.isWaterTimerRunning) {
      this.status = 'Water Task';
    } else {
      this.status = 'Vacant';
    }
  }

  calculateStage(date: any): number {
    return Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  }

  calculateScoops(date: any): number {
    return this.calculateStage(date) * 2;
  }

  calculateBottles(date: any): number {
    return this.calculateStage(date) * 3;
  }

  goBack(): void {
    this.router.navigate(['/fyh']);
  }

  formatTime(time: number): string {

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}m ${seconds}s`;
  }
}
