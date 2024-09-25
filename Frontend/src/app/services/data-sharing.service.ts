import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  private scannedDataSource = new BehaviorSubject<any>(null); // Store scanned data
  currentScannedData = this.scannedDataSource.asObservable();

  constructor() {}

  // Method to update the scanned data
  updateScannedData(data: any) {
    console.log('Updating shared data:', data); // Debug log
    this.scannedDataSource.next(data);
  }
}
