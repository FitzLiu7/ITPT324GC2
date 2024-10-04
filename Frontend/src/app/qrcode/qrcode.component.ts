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
  uniqueUserName: string | null = null; // Store the unique username with timestamp

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.currentAuthenticatedUser();
    // Retrieve the list of staff tasks when the component is initialized
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
    this.currentRoomNumber = roomNumber;

    if (![1001, 1002, 1, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15].includes(Number(roomNumber))) {
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

  resolveRoomNumber(roomNumber: string): number {
    if (roomNumber === 'N1') return 1001;
    if (roomNumber === 'N2') return 1002;
    return Number(roomNumber);
  }

  fetchSubRoomData(mainRoomNumber: number) {
    const subRoomNumbers =
      mainRoomNumber === 14
        ? [14, 141, 142, 143]
        : mainRoomNumber === 15
        ? [15, 151]
        : [];

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
        this.scanErrorMessage = 'Error fetching room data. Please try again.';
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
        this.roomData = {
          ...data,
          Stage: this.calculateStage(data.Date),
          Scoops: this.calculateScoops(data.Date),
          Bottles: this.calculateBottles(data.Date),
        };

        this.resetTimers();
        this.currentUserTask =
          this.taskList.find((task) => task.userName.startsWith(this.userName)) || null; // Check for unique userName

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
    this.status = 'Idle';
  }

  toggleFoodTimer() {
    if (this.isFoodTimerRunning) {
        // Stopping the timer
        if (!this.currentUserTask) {
            console.error('No active task found.');
            return;
        }

        if (!confirm('Are you sure you want to end the Food task?')) return;

        const params = {
            userName: this.currentUserTask.userName, // Use the unique userName stored in the task
            task: 'Food',
            working: false,
            endTime: Date.now(),
            roomNumber: this.currentRoomNumber,
            startTime: this.currentUserTask.startTime, // Keep the original start time
        };

        console.log('Sending the following params to the API:', params);

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
        // Starting the timer
        if (!confirm('Are you sure you want to start the Food task?')) return;

        // Check if there's already an active task for this user
        if (this.taskList.some(task => task.userName.startsWith(this.userName) && task.working)) {
            console.error('An active task already exists for this user.');
            alert('You already have an active task. Please stop it before starting a new one.');
            return;
        }

        const params: StaffTask = {
            userName: this.userName, // Store the initial user name
            startTime: Date.now(),
            task: 'Food',
            working: true,
            roomNumber: this.currentRoomNumber,
        };

        console.log('Sending the following params to the API:', params);

        this.apiService.addStaffTask(params).subscribe(
            (response: any) => {
                this.uniqueUserName = response.data.userName; // Store the unique user name
                this.currentUserTask = response.data; // Set the current user task
                this.startFoodTimer();
                this.updateStatus();
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
      this.foodElapsedTime = Math.floor(
        (Date.now() - this.foodStartTime!.getTime()) / 1000
      );
    }, 1000);
    this.updateStatus();
  }

  toggleWaterTimer() {
    if (this.isWaterTimerRunning) {
        // Stopping the timer
        if (!this.currentUserTask) {
            console.error('No active task found.');
            return;
        }

        if (!confirm('Are you sure you want to end the Water task?')) return;

        const params = {
            userName: this.currentUserTask.userName, // Use the unique userName stored in the task
            task: 'Water',
            working: false,
            endTime: Date.now(),
            roomNumber: this.currentRoomNumber,
            startTime: this.currentUserTask.startTime, // Keep the original start time
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
        // Starting the timer
        if (!confirm('Are you sure you want to start the Water task?')) return;

        // Check if there's already an active task for this user
        if (this.taskList.some(task => task.userName.startsWith(this.userName) && task.working)) {
            console.error('An active task already exists for this user.');
            alert('You already have an active task. Please stop it before starting a new one.');
            return;
        }

        const params: StaffTask = {
            userName: this.userName, // Store the initial user name
            startTime: Date.now(),
            task: 'Water',
            working: true,
            roomNumber: this.currentRoomNumber,
        };

        this.apiService.addStaffTask(params).subscribe(
            (response: any) => {
                this.uniqueUserName = response.data.userName; // Store the unique user name
                this.currentUserTask = response.data; // Set the current user task
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
      this.waterElapsedTime = Math.floor(
        (Date.now() - this.waterStartTime!.getTime()) / 1000
      );
    }, 1000);
    this.updateStatus();
  }

  updateStatus() {
    if (this.isFoodTimerRunning) {
      this.status = 'Working';
    } else if (this.isWaterTimerRunning) {
      this.status = 'Working';
    } else {
      this.status = 'Idle';
    }
  }

  private calculateStage(stockDate?: string): string {
    if (!stockDate) return '--';

    const startDate = new Date(stockDate);
    const currentDate = new Date();
    const daysDiff = this.getDaysDifference(startDate, currentDate);

    if (daysDiff < 3) return 'Babies';
    else if (daysDiff < 8) return 'Extra Small';
    else if (daysDiff < 14) return 'Small';
    else if (daysDiff < 21) return 'Medium';
    else if (daysDiff < 28) return 'Large';
    else if (daysDiff < 35) return 'Breeders';
    else if (daysDiff < 49) return 'Eggpots';
    else return '-----';
  }

  private calculateScoops(stockDate?: string): string {
    if (!stockDate) return '--';
    const startDate = new Date(stockDate);
    const currentDate = this.adjustToNearestFeedingDay(new Date());
    const daysDiff = this.getDaysDifference(startDate, currentDate);
    if (daysDiff < 7) return '1/2 ';
    else if (daysDiff < 14) return '1 ';
    else if (daysDiff < 21) return '1-1/2 ';
    else if (daysDiff < 28) return '2 ';
    else if (daysDiff < 43) return '2-1/2 ';
    else if (daysDiff < 45) return '1/2 ';
    else return '--';
  }

  private calculateBottles(stockDate?: string): string {
    if (!stockDate) return '--';
    const startDate = new Date(stockDate);
    const currentDate = this.adjustToNearestFeedingDay(new Date());
    const daysDiff = this.getDaysDifference(startDate, currentDate);
    if (daysDiff < 14) return 'Sponge';
    else if (daysDiff < 21) return '2 Rings';
    else if (daysDiff < 44) return '1 Ring';
    else if (daysDiff < 45) return '1 Ring / 1 Bottle';
    else return '--';
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
