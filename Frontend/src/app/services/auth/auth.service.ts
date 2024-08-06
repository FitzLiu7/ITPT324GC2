import { Injectable } from '@angular/core';
import { Auth } from '';

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
