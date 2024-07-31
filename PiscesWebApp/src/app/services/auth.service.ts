// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth } from 'aws-amplify';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  signUp(username: string, password: string, email: string) {
    return Auth.signUp({
      username,
      password,
      attributes: {
        email,
      },
    });
  }

  signIn(username: string, password: string) {
    return Auth.signIn(username, password);
  }

  signOut() {
    return Auth.signOut();
  }
}
