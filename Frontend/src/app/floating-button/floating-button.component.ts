import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddModalComponent } from '../modals/add-modal/add-modal.component';
import { UpdateModalComponent } from '../modals/update-modal/update-modal.component';
import { ReleaseModalComponent } from '../modals/release-modal/release-modal.component';

@Component({
  selector: 'app-floating-button', // Selector to use this component in templates
  standalone: true, // Indicates that this component can be used independently without being declared in a module
  imports: [
    CommonModule, // Allows access to Angular's common directives (e.g., ngIf, ngFor)
    AddModalComponent, // Importing AddModalComponent to use within this component
    UpdateModalComponent, // Importing UpdateModalComponent to use within this component
    ReleaseModalComponent, // Importing ReleaseModalComponent to use within this component
  ],
  templateUrl: './floating-button.component.html', // Path to the HTML template
  styleUrls: ['./floating-button.component.css'], // Path to the CSS file
})
export class FloatingButtonComponent {
  menuOpen = false; // Tracks whether the floating menu is open or closed
  currentModal: 'add' | 'update' | 'release' | null = null; // Tracks which modal is currently open, if any

  // Toggles the floating menu's visibility
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Opens a specific modal and closes the menu
  openModal(modal: 'add' | 'update' | 'release') {
    this.menuOpen = false; // Close the menu when a modal is opened
    this.currentModal = modal; // Set the current modal to the one selected
  }

  // Closes any open modal
  closeModal() {
    this.currentModal = null; // Reset the current modal to null
  }
}
