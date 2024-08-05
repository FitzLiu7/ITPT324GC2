import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-release-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './release-modal.component.html',
  styleUrls: ['./release-modal.component.css'],
})
export class ReleaseModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  room: string = '';
  week: number = 0;
  quantity: number = 0;

  availableRooms: string[] = [];

  ngOnInit() {
    this.availableRooms = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
    ];

    this.week = this.getWeekNumber(new Date());
  }

  closeModal() {
    this.close.emit();
  }

  submitForm() {
    console.log('Form submitted:', {
      room: this.room,
      week: this.week,
      quantity: this.quantity,
    });
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
