import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { debounceTime, switchMap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl; // Dynamically set API URL
  private wsUrl = environment.wsUrl; // Dynamically set WebSocket URL
  private socket$: WebSocketSubject<any>;
  private dataSubject = new Subject<any>(); // Subject to emit data updates

  constructor(private http: HttpClient) {
    // Initialize WebSocket connection
    this.socket$ = webSocket(this.wsUrl);
    this.setupWebSocket();
  }
  // getUserList Api
  getUserList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getUserList`);
  }
  // get StaffTask list
  getStaffTaskList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getStaffTaskList`);
  }

  // add StaffTask
  addStaffTask(obj: { userName:string, startTime: number, roomNumber: string| number, task: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addStaffTask`, obj);
  }

  // update StaffTask
  updateStaffTask(obj: { userName:string, startTime: number, roomNumber: string| number, task: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updateStaffTask`, obj);
  }

  // RoomNumber, Date, FoodType, WaterType, GetList
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
  deleteRoomData(RoomNumber: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-data/${RoomNumber}`);
  }

  // Set up WebSocket connection with handling of message updates
  private setupWebSocket() {
    this.socket$
      .pipe(
        debounceTime(200), // Adjust debounce time as needed
        switchMap(() => this.getList()) // Fetch updated data on receiving a WebSocket message
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
        (err) => console.error('WebSocket error:', err),
        () => console.log('WebSocket connection closed')
      );
  }

  // Observable to subscribe to data changes
  getDataUpdates(): Observable<any> {
    return this.dataSubject.asObservable();
  }
}
