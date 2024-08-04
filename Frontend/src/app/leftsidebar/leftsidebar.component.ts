import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-leftsidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './leftsidebar.component.html',
  styleUrl: './leftsidebar.component.css',
})
export class LeftsidebarComponent {}
