import { Component } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ApiService } from '../api.service'; // Importing the service to get data
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qrcode',
  standalone: true,
  imports: [CommonModule,ZXingScannerModule],
  templateUrl: './qrcode.component.html',
  styleUrl: './qrcode.component.css',
})
export class QRcodeComponent {
  constructor(private apiService: ApiService) {} // Injecting the ApiService
  showModal: boolean = false;
  roomData: any = null;
  scannerResult: string | null = null;
  isShow(): boolean{
    return this.showModal
  }
  closeModal() {
    this.showModal = false;
  }
  toStringRoomData(){
    if(this.roomData != null){
      return JSON.stringify(this.roomData)
    }else{
      return ''
    }
  }
  onCodeResult(resultString: string) {
    this.scannerResult = resultString;
    console.log(resultString);
    console.log(Number(resultString));
    if (!isNaN(Number(resultString))) {
      this.apiService.getRoomData(Number(resultString)).subscribe(
        (initialData) => {
          console.log('Initial data:', initialData);
          this.showModal = true;
          this.roomData = initialData;
        },
        (error) => {
          console.error('Error fetching initial data:', error);
          alert(error.error.message);
        }
      );
    }
  }
}
