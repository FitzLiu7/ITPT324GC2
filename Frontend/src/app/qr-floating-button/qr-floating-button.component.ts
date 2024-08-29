import { Component } from '@angular/core';

@Component({
  selector: 'app-qr-floating-button',
  standalone: true,
  templateUrl: './qr-floating-button.component.html',
  styleUrls: ['./qr-floating-button.component.css'],
})
export class QrFloatingButtonComponent {
  menuOpen = false;
  currentModal: 'add' | 'update' | 'release' | null = null;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeModal() {
    this.currentModal = null;
  }

  openQrScanner() {}
}
