import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { HttpClientModule } from '@angular/common/http';

interface Room {
  name: string;
  stock: number;
  stage: string;
  week: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export default class DashboardComponent implements OnInit {
  rooms: Room[] = [];

  // insectStock: any[] = [];
  // constructor(private apiService: ApiService) {}
  // getList() {
  //   this.apiService.getList().subscribe(
  //     (data) => {
  //       console.log(data);

  //       this.insectStock = data;
  //     },
  //     (error) => {
  //       console.error('Error fetching insect production stock:', error);
  //     }
  //   );
  // }

  ngOnInit() {
    this.rooms = [
      { name: '1', stock: 84, stage: 'Babies', week: 29 },
      { name: '2', stock: 42, stage: 'Medium', week: 29 },
      { name: '3', stock: 42, stage: 'Large', week: 29 },
      { name: '4', stock: 84, stage: 'Breeders', week: 30 },
      { name: '5', stock: 42, stage: 'Babies', week: 30 },
      { name: '6', stock: 42, stage: 'Xsmall', week: 30 },
      { name: '7', stock: 84, stage: 'Large', week: 31 },
      { name: '8', stock: 42, stage: 'Medium', week: 31 },
      { name: '9', stock: 42, stage: 'Babies', week: 31 },
      { name: '10', stock: 84, stage: 'Large', week: 32 },
      { name: '11', stock: 42, stage: 'Medium', week: 32 },
      { name: '12', stock: 42, stage: 'Babies', week: 32 },
      { name: '13', stock: 84, stage: 'Medium', week: 33 },
      { name: '14', stock: 42, stage: 'Medium', week: 32 },
      { name: '15', stock: 42, stage: 'Babies', week: 32 },
      { name: '16', stock: 84, stage: 'Medium', week: 33 },
    ];
  }
}
