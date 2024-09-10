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

  // Map for converting display names to numeric values
  roomDisplayNames: { [key: string]: number } = {
    'N1': 1001,
    'N2': 1002,
  };

  // Array for dropdown options
  roomOptions: { display: string, value: number | string }[] = [
    { display: 'N1', value: 'N1' },
    { display: 'N2', value: 'N2' },
    { display: '1', value: 1 },
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

    this.apiService.deleteRoomData(numericRoomNumber).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.error(error);
      }
    );
    this.closeModal();
  }

  // Convert display names to numeric values
  private convertRoomNumberToNumeric(roomNumber: number | string | undefined): number | undefined {
    if (typeof roomNumber === 'string') {
      return this.roomDisplayNames[roomNumber] ?? undefined;
    }
    return typeof roomNumber === 'number' ? roomNumber : undefined;
  }
}
