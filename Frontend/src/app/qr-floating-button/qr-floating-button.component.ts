import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRcodeComponent } from '../qrcode/qrcode.component'; // Import QRcodeComponent

@Component({
  selector: 'app-qr-floating-button',
  standalone: true,
  templateUrl: './qr-floating-button.component.html',
  styleUrls: ['./qr-floating-button.component.css'],
  imports: [CommonModule, QRcodeComponent], // Add QRcodeComponent to imports
})
export class QrFloatingButtonComponent {
  showModal = false;

  openQrScanner() {
    this.showModal = true;
  }

  closeQrScanner() {
    this.showModal = false;
  }
}
