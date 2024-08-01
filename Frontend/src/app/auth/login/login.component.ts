import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  onSubmit() {
    // Aquí puedes añadir la lógica de autenticación
    console.log('Email:', this.email);
    console.log('Password:', this.password);
  }
}
