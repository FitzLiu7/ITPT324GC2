import { Component, OnInit, OnDestroy } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MinutesSecondsPipe } from '../minutes-seconds.pipe';
import { getCurrentUser } from 'aws-amplify/auth';

interface StaffTask {
  TaskID: string; // Added TaskID
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
  foodTimer: any; // Interval reference for the food timer
  waterTimer: any; // Interval reference for the water timer
  foodStartTime: Date | null = null; // Start time for the food task
  waterStartTime: Date | null = null; // Start time for the water task
  foodEndTime: Date | null = null;
  waterEndTime: Date | null = null;
  foodElapsedTime = 0; // Tracks the elapsed time for the food task
  waterElapsedTime = 0; // Tracks the elapsed time for the water task
  isFoodTimerRunning = false; // Indicates if the food timer is running
  isWaterTimerRunning = false; // Indicates if the water timer is running
  status: string = 'Vacant'; // Current status display
  taskList: StaffTask[] = []; // List of tasks retrieved from the backend
  currentUserTask: StaffTask | null = null; // The current task for the logged-in user
  currentRoomNumber: number = 0; // Stores the currently scanned room number
  currentTaskID: string | null = null; // Store the current TaskID if needed

  constructor(private apiService: ApiService, private router: Router) {}

    // Generate a new TaskID
    generateTaskID(): string {
      return `TASK-${Date.now()}`;
    }

  ngOnInit() {
    this.currentAuthenticatedUser();
    // Retrieve the list of staff tasks when component is initialized
    this.apiService.getStaffTaskList().subscribe(
      (res: StaffTask[]) => {
        this.taskList = res.map((task) => ({
          ...task,
          elapsedTime: task.endTime ? task.endTime - task.startTime : 0,
        }));

        // Update currentUserTask based on TaskID if needed
        this.currentUserTask = this.taskList.find((task) => task.TaskID === this.currentTaskID) || null; // Update as needed
      },
      (error: any) => {
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
    this.currentRoomNumber = roomNumber;

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
      .catch((error: any) => {
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
          this.foodElapsedTime = Math.floor(
            (Date.now() - this.currentUserTask.startTime) / 1000
          );
          this.waterElapsedTime = Math.floor(
            (Date.now() - this.currentUserTask.startTime) / 1000
          );
        }

        this.scanSuccess = true;
        this.isScannerOpen = false;
      },
      (error: any) => {
        console.error('Error fetching room data:', error);
        this.scanError = true;
        this.scanErrorMessage = 'Error fetching room data. Please try again.';
      }
    );
  }

  // Start or stop the food timer
  toggleFoodTimer() {
    if (this.isFoodTimerRunning) {
      this.stopFoodTimer();
    } else {
      this.startFoodTimer();
    }
  }

// Start the food timer
startFoodTimer() {
  if (!this.isFoodTimerRunning) {
      this.isFoodTimerRunning = true; // Set running state
      const params = {
          TaskID: this.generateTaskID(), // Generate TaskID
          userName: this.userName,
          startTime: Date.now(),
          task: 'Food',
          roomNumber: this.currentRoomNumber,
          working: true, // Indicate the task is active
      };

      // Call the API to add the task
      this.apiService.addStaffTask(params).subscribe(
          (response: any) => {
              console.log('Food task added:', response);
              this.foodStartTime = new Date(params.startTime); // Capture start time
              this.currentUserTask = {
                  TaskID: params.TaskID,
                  userName: params.userName,
                  roomNumber: params.roomNumber,
                  startTime: params.startTime,
                  task: params.task,
                  working: params.working,
              }; // Ensure currentUserTask has the correct structure

              this.foodTimer = setInterval(() => {
                  if (this.foodStartTime) { // Check if foodStartTime is not null
                      this.foodElapsedTime = Math.floor((Date.now() - this.foodStartTime.getTime()) / 1000);
                  }
              }, 1000);
          },
          (error: any) => {
              console.error('Error adding food task:', error);
          }
      );
  }
}

// Stop the food timer
async stopFoodTimer() {
  try {
    if (this.foodStartTime && this.currentUserTask) {
      const startTime = this.foodStartTime ? this.foodStartTime.getTime() : Date.now(); // Fallback to current time if foodStartTime is null

      const params = {
        TaskID: this.currentUserTask.TaskID,
        userName: this.userName,
        startTime, // Ensure startTime is a number
        roomNumber: this.currentRoomNumber,
        task: 'Food',
        endTime: Date.now(), // Current time as end time
        working: false,
      };

      const response = await this.apiService.updateStaffTask(params).toPromise();
      console.log('Food task stopped:', response);

      this.foodElapsedTime = 0; // Reset elapsed time
      this.foodStartTime = null; // Clear start time
      this.foodEndTime = new Date(Date.now()); // Set the end time
    } else {
      console.error('Cannot stop food timer: No active task or start time is null.');
    }
  } catch (error) {
    console.error('Error stopping food task:', error);
  }
}

  // Start or stop the water timer
  toggleWaterTimer() {
    if (this.isWaterTimerRunning) {
      this.stopWaterTimer();
    } else {
      this.startWaterTimer();
    }
  }


// Start the water timer
startWaterTimer() {
  if (!this.isWaterTimerRunning) {
    this.isWaterTimerRunning = true; // Mark the water timer as running

    // Check if there's an existing currentUserTask; if not, generate a new TaskID
    const params = {
      TaskID: this.currentUserTask ? this.currentUserTask.TaskID : this.generateTaskID(), // Use existing TaskID if there is a current task
      userName: this.userName,
      startTime: Date.now(), // Capture the current time as the start time
      task: 'Water', // Specify the task as "Water"
      roomNumber: this.currentRoomNumber, // Room number associated with the task
      working: true, // Indicate the task is active
    };

    // Call API to add the water task
    this.apiService.addStaffTask(params).subscribe(
      (response: any) => {
        console.log('Water task added:', response);
        this.waterStartTime = new Date(params.startTime); // Set the start time

        if (!this.currentUserTask) {
          this.currentUserTask = { ...params, elapsedTime: 0 }; // Initialize the task
        }

        this.waterTimer = setInterval(() => {
          if (this.waterStartTime) {
            this.waterElapsedTime = Math.floor((Date.now() - this.waterStartTime.getTime()) / 1000);
          }
        }, 1000);
      },
      (error: any) => {
        console.error('Error adding water task:', error);
      }
    );
  }
}


// Stop the water timer
async stopWaterTimer() {
  try {
    if (this.waterStartTime && this.currentUserTask) {
      const startTime = this.waterStartTime.getTime(); // Get the start time safely

      const params = {
        TaskID: this.currentUserTask.TaskID,
        userName: this.userName,
        startTime, // Ensure startTime is a number
        roomNumber: this.currentRoomNumber,
        task: 'Water',
        endTime: Date.now(), // Current time as end time
        working: false,
      };

      const response = await this.apiService.updateStaffTask(params).toPromise();
      console.log('Water task stopped:', response);

      this.waterElapsedTime = 0; // Reset elapsed time
      this.waterStartTime = null; // Clear start time
      this.waterEndTime = new Date(Date.now()); // Set the end time
    } else {
      console.error('Cannot stop water timer: No active task or start time is null.');
    }
  } catch (error) {
    console.error('Error stopping water task:', error);
  }
}


  // Reset all timers
  resetTimers() {
    if (this.foodTimer) clearInterval(this.foodTimer);
    if (this.waterTimer) clearInterval(this.waterTimer);
    this.foodElapsedTime = 0;
    this.waterElapsedTime = 0;
    this.isFoodTimerRunning = false;
    this.isWaterTimerRunning = false;
  }

  private calculateStage(stockDate?: string): string {
    if (!stockDate) return '--'; // Return 'Unknown' if no date is provided

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
