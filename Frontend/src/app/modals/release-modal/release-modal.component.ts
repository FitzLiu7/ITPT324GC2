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

  RoomNumber?: number;
  constructor(private apiService: ApiService) {}

  ngOnInit() {}

  closeModal() {
    this.close.emit();
  }

  submitForm() {
    this.apiService.deleteRoomData(Number(this.RoomNumber)).subscribe(
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
