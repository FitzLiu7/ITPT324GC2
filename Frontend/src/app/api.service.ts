import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, timer } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { debounceTime, switchMap, retryWhen, delay, take, catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl; // Dynamically set API URL
  private wsUrl = environment.wsUrl; // Dynamically set WebSocket URL
  private socket$!: WebSocketSubject<any>;
  private dataSubject = new Subject<any>(); // Subject to emit data updates
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 3000; // 3 seconds

  constructor(private http: HttpClient) {
    // Initialize WebSocket connection
    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.socket$ = webSocket(this.wsUrl);
    this.setupWebSocket();
    
    this.socket$.subscribe(
      () => {}, // Handle messages in `setupWebSocket`
      (error) => {
        console.error('WebSocket error:', error);
        this.reconnect(); // Attempt to reconnect on error
      },
      () => {
        console.log('WebSocket connection closed');
        this.reconnect(); // Attempt to reconnect on closure
      }
    );
  }

  // Reconnect logic
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts})`);
      setTimeout(() => this.connectWebSocket(), this.reconnectDelay);
    } else {
      console.error('Max reconnect attempts reached. WebSocket will not reconnect.');
    }
  }

  // Set up WebSocket connection with handling of message updates
  private setupWebSocket() {
    this.socket$
      .pipe(
        debounceTime(200), // Adjust debounce time as needed
        switchMap(() => this.getList()), // Fetch updated data on receiving a WebSocket message
        catchError((error) => {
          console.error('Error in WebSocket stream:', error);
          return [];
        })
      )
      .subscribe(
        (data) => {
          if (Array.isArray(data)) {
            // Ensure data is an array
            console.log('WebSocket data received:', data);
            this.dataSubject.next(data); // Emit WebSocket data
          } else {
            console.error('Unexpected WebSocket data format:', data);
          }
        },
        (err) => console.error('WebSocket error:', err)
      );
  }

  // Observable to subscribe to data changes
  getDataUpdates(): Observable<any> {
    return this.dataSubject.asObservable();
  }

  // API methods
  signUp(username: string, password: string, email: string): Observable<any> {
    const userData = { username, password, email };
    return this.http.post<any>(`${this.apiUrl}/signup`, userData);
  }

  confirmSignUp(username: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm-signup`, { username, code });
  }

  getUserList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getUserList`);
  }

  getStaffTaskList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getStaffTaskList`);
  }

  addStaffTask(obj: { userName: string; startTime: number; roomNumber: string | number; task: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addStaffTask`, obj);
  }

  updateStaffTask(obj: { userName: string; startTime: number; roomNumber: string | number; task: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updateStaffTask`, obj);
  }

  addRoomData(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-data`, data);
  }

  getList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-list`);
  }

  getRoomData(data: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-data/${data}`);
  }

  updateRoomData(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-data`, data);
  }

  releaseTubsFromRoom(roomNumber: number | string, amount: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/release-tubs`, { RoomNumber: roomNumber, amount });
  }
}