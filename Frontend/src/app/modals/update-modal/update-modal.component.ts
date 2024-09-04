import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-update-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-modal.component.html',
  styleUrls: ['./update-modal.component.css'],
})
export class UpdateModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  RoomNumber?: number;
  Week: number = 0;
  Stock: number = 0;
  Tubs?: number;
  Date: string = '';

  availableRooms: number[] = [];
  showErrors: boolean = false; // Property to track validation errors

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.availableRooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    this.Week = this.getWeekNumber(new Date());
  }

  closeModal() {
    this.close.emit();
    this.showErrors = false; // Reset errors when closing the modal
  }

  submitForm() {
    // Check if all fields are filled
    if (!this.RoomNumber || !this.Week || !this.Tubs || !this.Date) {
      this.showErrors = true; // Show errors if any required field is missing
      return;
    }

    let obj = {
      RoomNumber: Number(this.RoomNumber),
      Week: this.Week,
      Stock: this.Stock,
      Tubs: Number(this.Tubs),
      Date: this.Date,
    };
    console.log('Form submitted:', obj);

    this.apiService.updateRoomData(obj).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.error(error);
      }
    );

    this.closeModal();
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
