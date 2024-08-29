import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-leftsidebar', // The selector to use this component in templates
  standalone: true, // This component can be used independently without being declared in a module
  imports: [RouterLink, CommonModule], // Importing necessary modules for the component
  templateUrl: './leftsidebar.component.html', // Path to the HTML template
  styleUrls: ['./leftsidebar.component.css'], // Path to the CSS file
})
export class LeftsidebarComponent {
  constructor(private router: Router) {} // Injecting the Router service to use for navigation checks

  // Method to check if a given URL is the current active route
  isActive(url: string): boolean {
    return this.router.url === url; // Returns true if the current URL matches the provided URL
  }
}
