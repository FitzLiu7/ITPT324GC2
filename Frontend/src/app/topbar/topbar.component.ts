import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getCurrentUser } from 'aws-amplify/auth';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {
  userName: string = '';
  userRole: string = '';
  dropdownOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentAuthenticatedUser()
  }

  async currentAuthenticatedUser() {
    try {
      const { username } = await getCurrentUser();
      this.userName = username;
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
}
