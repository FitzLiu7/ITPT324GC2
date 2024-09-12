import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/fyh']); // Navigate to home or another page
  }
}
