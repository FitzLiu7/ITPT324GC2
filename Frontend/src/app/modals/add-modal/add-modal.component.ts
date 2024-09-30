import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-modal.component.html',
  styleUrls: ['./add-modal.component.css'],
})
export class AddModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  RoomNumber?: number | string;
  Week: number = 0;
  Stock: number = 0;
  FoodType: string = '1/2';
  WaterType: string = 'sponge';
  Tubs?: number;
  Date: string = '';
  StockType: string = '';

  availableRooms: (number | string)[] = [];
  stockTypes: string[] = ['Breeders', 'Sales'];

  showErrors: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.availableRooms = [
      'N1',
      'N2',
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      141,
      142,
      143,
      15,
      151,
      152,
    ];
    this.Week = this.getWeekNumber(new Date());
  }

  closeModal() {
    this.close.emit();
  }

  submitForm() {
    // Validate the required fields
    if (!this.RoomNumber || !this.Tubs || !this.Date || !this.StockType) {
      this.showErrors = true;
      console.error('Please fill in all required fields.');
      return;
    }

    let mappedRoomNumber = this.RoomNumber;
    if (this.RoomNumber === 'N1') {
      mappedRoomNumber = 1001; // Assign N1 to a numeric value
    } else if (this.RoomNumber === 'N2') {
      mappedRoomNumber = 1002; // Assign N2 to a numeric value
    }

    let obj = {
      RoomNumber: Number(mappedRoomNumber),
      Week: this.Week,
      Stock: this.Stock,
      FoodType: this.FoodType,
      WaterType: this.WaterType,
      Tubs: Number(this.Tubs),
      Date: this.Date,
      StockType: this.StockType,
    };

    console.log('Form submitted:', obj);

    this.apiService.addRoomData(obj).subscribe(
      (data) => {
        console.log('Data successfully submitted:', data);
        this.closeModal();
      },
      (error) => {
        console.error('Error submitting data:', error);
      }
    );
  }

  getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      (((d as any) - (yearStart as any)) / 86400000 + 1) / 7
    );
    return weekNo;
  }
}
