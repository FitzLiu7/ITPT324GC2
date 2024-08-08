import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000';
  private pollInterval = 3000; // Poll every 3 seconds
  private dataSubject = new Subject<any>(); // Subject to emit data updates

  constructor(private http: HttpClient) {
    this.startPolling();
  }
  

  // RoomNumber, Date, FoodType, WaterType, GetList
  addRoomData(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-data`, data);
  }
  getList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-list`);
  }
  getRoomData(data: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-data`, data);
  }
  updateRoomData(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-data`, data);
  }
  deleteRoomData(RoomNumber: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-data/${RoomNumber}`);
  }

  // Polling logic
  private startPolling() {
    this.getList()
      .pipe(
        switchMap(data => {
          this.dataSubject.next(data); // Emit new data
           return new Observable<void>(observer => {
            setInterval(() => {
              this.getList().subscribe(updatedData => {
                this.dataSubject.next(updatedData);
              });
            }, this.pollInterval);
          });
        })
      )
    .subscribe();
  }
  
  // Observable to subscribe to data changes
  getDataUpdates(): Observable<any> {
    return this.dataSubject.asObservable();
  }
}
