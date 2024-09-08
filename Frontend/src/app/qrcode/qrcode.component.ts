import { Component } from '@angular/core';
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

  constructor(private apiService: ApiService) {}

  // Opens the scanner
  openQrScanner() {
    this.isScannerOpen = true;
    this.roomData = null; // Resets the room data
  }

  // Closes the scanner
  closeQrScanner() {
    this.isScannerOpen = false;
  }

  // Handles the result of the scanned QR code
  onCodeResult(resultString: string) {
    this.scannerResult = resultString;
    console.log('Scanned QR:', resultString);

    // If the QR code is a valid number, fetch the room information
    if (!isNaN(Number(resultString))) {
      this.apiService.getRoomData(Number(resultString)).subscribe(
        (data) => {
          console.log('Room data:', data);
          // Assign fetched data
          this.roomData = data;

          // Calculate stage, scoops, and bottles and add to roomData object
          this.roomData.Stage = this.calculateStage(this.roomData.Date);
          this.roomData.Scoops = this.calculateScoops(this.roomData.Date);
          this.roomData.Bottles = this.calculateBottles(this.roomData.Date);

          this.closeQrScanner(); // Closes the camera after scanning
        },
        (error) => {
          console.error('Error fetching room data:', error);
          alert(error.error.message);
        }
      );
    }
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
    else return '-----';
  }

  private calculateScoops(stockDate?: string): string {
    if (!stockDate) return 'Unknown';
    const startDate = new Date(stockDate);
    const currentDate = this.adjustToNearestFeedingDay(new Date());
    const daysDiff = this.getDaysDifference(startDate, currentDate);
    if (daysDiff < 8) return '1/2 Scoop';
    else if (daysDiff < 15) return '1 Scoop';
    else if (daysDiff < 22) return '1-1/2 Scoops';
    else if (daysDiff < 29) return '2 Scoops';
    else if (daysDiff < 40) return '2-1/2 Scoops';
    else if (daysDiff < 45) return '1/2 Scoop';
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
