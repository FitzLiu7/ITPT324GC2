import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { LeftsidebarComponent } from './leftsidebar/leftsidebar.component';
import DashboardComponent from './dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { AddModalComponent } from './modals/add-modal/add-modal.component';
import { UpdateModalComponent } from './modals/update-modal/update-modal.component';
import { ReleaseModalComponent } from './modals/release-modal/release-modal.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TopbarComponent,
    LeftsidebarComponent,
    CommonModule,
    DashboardComponent,
    AddModalComponent,
    UpdateModalComponent,
    ReleaseModalComponent,
    FormsModule,
    LoginComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'PiscesWebApp';
  showLayout = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showLayout = !this.router.url.includes('/login');
      }
    });
  }

  ngOnInit() {}
}
