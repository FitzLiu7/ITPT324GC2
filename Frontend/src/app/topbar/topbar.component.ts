import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getCurrentUser } from 'aws-amplify/auth';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  imports: [CommonModule], // Add CommonModule here
})
export class TopbarComponent implements OnInit {
  userName: string = '';
  userRole: string = '';
  dropdownOpen = false;

  currentWeek: number = 0;
  currentDate: Date = new Date();
  currentTime: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentAuthenticatedUser();
    this.updateCurrentTime();
    this.calculateCurrentWeek();
    setInterval(() => this.updateCurrentTime(), 1000); // Update the time every second
  }

  async currentAuthenticatedUser() {
    try {
      const { username } = await getCurrentUser();
      this.userName = username;

      // Determine the user role based on the username prefix
      if (username.startsWith('st')) {
        this.userRole = 'Staff';
      } else if (username.startsWith('sp')) {
        this.userRole = 'Supervisor';
      } else if (username.startsWith('mg')) {
        this.userRole = 'Manager';
      } else {
        this.userRole = 'Unknown Role';
      }
    } catch (err) {
      console.log(err);
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    console.log('Logout clicked');
    this.dropdownOpen = false;
    this.router.navigate(['/login']);
  }

  // Calculate the current week of the year
  calculateCurrentWeek() {
    const startOfYear = new Date(this.currentDate.getFullYear(), 0, 1);
    const diff = this.currentDate.getTime() - startOfYear.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    this.currentWeek = Math.ceil(diff / oneWeek);
  }

  // Update the current time every second
  updateCurrentTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
