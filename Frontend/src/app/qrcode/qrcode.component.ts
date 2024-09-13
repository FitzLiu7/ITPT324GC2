import { Component, EventEmitter, Output } from '@angular/core'; // Add EventEmitter and Output
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ApiService } from '../api.service'; // Importing the service to get data
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qrcode',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.css'],
})
export class QRcodeComponent {
  isScannerOpen = true; // Controls whether the camera is open
  roomData: any = null; // Scanned room data
  scannerResult: string | null = null;
  scanSuccess = false; // Indicates whether the scan was successful
  scanError = false; // Flag for showing an error message
  scanErrorMessage = ''; // Error message to display

  // Define an EventEmitter for the close event
  @Output() close = new EventEmitter<void>();

  constructor(private apiService: ApiService) {}

  // Opens the scanner
  openQrScanner() {
    this.isScannerOpen = true;
    this.roomData = null; // Resets the room data
    this.scanSuccess = false; // Reset the success flag
    this.scanError = false; // Reset error flag
    this.scanErrorMessage = ''; // Clear error message
  }

  // Closes the scanner and hides the modal
  closeQrScanner() {
    this.isScannerOpen = false;
    this.closeModal(); // Trigger modal close event
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
        // Assign fetched data
        this.roomData = data;

        // Calculate stage, scoops, and bottles and add to roomData object
        this.roomData.Stage = this.calculateStage(this.roomData.Date);
        this.roomData.Scoops = this.calculateScoops(this.roomData.Date);
        this.roomData.Bottles = this.calculateBottles(this.roomData.Date);

        this.scanSuccess = true; // Indicate that the scan was successful
        this.closeQrScanner(); // Closes the camera after scanning
      },
      (error) => {
        console.error('Error fetching room data:', error);
        this.scanError = true;
        this.scanErrorMessage = 'Error fetching room data';
      }
    );
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

  // Emits the close event to parent component
  closeModal() {
    this.close.emit(); // Emit the close event to parent component
  }
}
