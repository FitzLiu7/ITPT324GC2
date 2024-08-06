import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getCurrentUser() {
    return {
      name: 'Chloe',
      role: 'Supervisor',
    };
  }
}
