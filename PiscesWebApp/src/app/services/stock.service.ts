import { Injectable } from '@angular/core';
import { API } from 'aws-amplify';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  addStock(
    room: string,
    quantity: number,
    insectType: string,
    productionDate: Date
  ) {
    return API.post('InsectProductionAPI', '/stock', {
      body: { room, quantity, insectType, productionDate },
    });
  }

  updateStock(
    room: string,
    quantity: number,
    insectType: string,
    productionDate: Date
  ) {
    return API.put('InsectProductionAPI', `/stock/${room}`, {
      body: { quantity, insectType, productionDate },
    });
  }

  releaseStock(room: string, quantity: number, releaseDate: Date) {
    return API.put('InsectProductionAPI', `/stock/release/${room}`, {
      body: { quantity, releaseDate },
    });
  }

  deleteStock(room: string) {
    const apiName = 'InsectProductionAPI';
    const path = `/stock/${room}`;
    const myInit = {};
    return API.del(apiName, path, myInit);
  }
}
