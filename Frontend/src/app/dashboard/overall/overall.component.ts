import { Component } from '@angular/core';

@Component({
  selector: 'app-overall',
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.css'],
})
export class OverallComponent {
  overallData = [
    { room: '01', week: 30, stage: 'Babies', quantity: 84 },
    // Agrega más datos aquí
  ];
}
