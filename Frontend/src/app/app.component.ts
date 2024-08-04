import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { LeftsidebarComponent } from './leftsidebar/leftsidebar.component';
import DashboardComponent from './dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { FloatingButtonComponent } from './floating-button/floating-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TopbarComponent,
    LeftsidebarComponent,
    CommonModule,
    DashboardComponent,
    FloatingButtonComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'PiscesWebApp';
}
