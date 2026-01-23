import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Business, ReserveItem } from '../../../interfaces/shared-interfaces';

@Injectable({
    providedIn: 'root'
})
export class ItemManagementService {
    constructor(private http: HttpClient) { }

    reserveitem(reserveItem: ReserveItem): Observable<any> {
        return this.http.post(`/consoleApi/item/management/reserve-item`, reserveItem);
    }

    getAllReservationsForItem(itemId: string): Observable<any> {
        return this.http.get(`/consoleApi/item/management/get-all-reservations-for-item/${itemId}`);
    }

}
