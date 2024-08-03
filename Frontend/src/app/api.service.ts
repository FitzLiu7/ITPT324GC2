import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // RoomNumber, Date, FoodType, WaterType
  addRoomData(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-data`, data);
  }
  getRoomData(data: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-data`, data);
  }
  updateRoomData(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-data`, data);
  }
  deleteRoomData(data: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-data`, data);
  }
}
