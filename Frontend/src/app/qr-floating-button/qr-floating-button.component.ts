import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import the Router

@Component({
  selector: 'app-qr-floating-button',
  standalone: true,
  templateUrl: './qr-floating-button.component.html',
  styleUrls: ['./qr-floating-button.component.css'],
})
export class QrFloatingButtonComponent {
  constructor(private router: Router) {}

  openQrScanner() {
    // Navigate to the QR scanner page
    this.router.navigate(['/QRcode']);
  }
}
