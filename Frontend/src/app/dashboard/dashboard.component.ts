import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  rooms = Array.from({ length: 13 }, (_, i) => ({
    id: i + 1,
    week: '',
    stage: '',
    quantity: ''
  }));

  showMenu = false;
  selectedRoom: any = {};

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  addData(room: any) {
    this.selectedRoom = room;
  
  }

  updateData(room: any) {
    this.selectedRoom = room;

  }

  releaseData(room: any) {
    this.selectedRoom = room;

  }
}
