import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-release-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './release-modal.component.html',
  styleUrls: ['./release-modal.component.css'],
})
export class ReleaseModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  RoomNumber?: number | string;
  amountToRemove: number | undefined; // Property for amount to remove

  // Map for converting display names to numeric values
  roomDisplayNames: { [key: string]: number } = {
    'N1': 1001,
    'N2': 1002,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '8': 8,
    '9': 9,
    '10': 10,
    '11': 11,
    '12': 12,
    '13': 13,
    '14': 14,
    '15': 15,
  };

  // Array for dropdown options
  roomOptions: { display: string; value: number | string }[] = [
    { display: 'N1', value: 'N1' },
    { display: 'N2', value: 'N2' },
    { display: '1', value: 1 },
    { display: '2', value: 2 },
    { display: '3', value: 3 },
    { display: '4', value: 4 },
    { display: '8', value: 8 },
    { display: '9', value: 9 },
    { display: '10', value: 10 },
    { display: '11', value: 11 },
    { display: '12', value: 12 },
    { display: '13', value: 13 },
    { display: '14', value: 14 },
    { display: '15', value: 15 },
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {}

  closeModal() {
    this.close.emit();
  }

  submitForm() {
    const numericRoomNumber = this.convertRoomNumberToNumeric(this.RoomNumber);

    if (numericRoomNumber === undefined) {
      console.error('Invalid room number.');
      return;
    }

    if (!this.amountToRemove || this.amountToRemove <= 0) {
      console.error('Invalid amount to remove.');
      return;
    }

    // Call the API service to release Tubs
    this.apiService.releaseTubsFromRoom(numericRoomNumber, this.amountToRemove).subscribe(
      (data) => {
        console.log('Release successful:', data);
        this.closeModal(); // Close the modal after successful API call
      },
      (error) => {
        console.error('Error releasing tubs:', error);
      }
    );
  }

  // Convert display names to numeric values
  private convertRoomNumberToNumeric(roomNumber: number | string | undefined): number | undefined {
    if (typeof roomNumber === 'string') {
      // Return the numeric value from the map if it exists
      return this.roomDisplayNames[roomNumber] ?? undefined;
    }
    // Return roomNumber if it's already a number
    return typeof roomNumber === 'number' ? roomNumber : undefined;
  }
}
