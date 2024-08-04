import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddModalComponent } from '../modals/add-modal/add-modal.component';
import { UpdateModalComponent } from '../modals/update-modal/update-modal.component';
import { ReleaseModalComponent } from '../modals/release-modal/release-modal.component';

@Component({
  selector: 'app-floating-button',
  standalone: true,
  imports: [
    CommonModule,
    AddModalComponent,
    UpdateModalComponent,
    ReleaseModalComponent,
  ],
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.css'],
})
export class FloatingButtonComponent {
  menuOpen = false;
  currentModal: 'add' | 'update' | 'release' | null = null;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  openModal(modal: 'add' | 'update' | 'release') {
    this.menuOpen = false;
    this.currentModal = modal;
  }

  closeModal() {
    this.currentModal = null;
  }
}
