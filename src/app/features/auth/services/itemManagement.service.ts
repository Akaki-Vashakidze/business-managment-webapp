import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Business, ItemManagement, ReserveItem } from '../../../interfaces/shared-interfaces';

@Injectable({
    providedIn: 'root'
})
export class ItemManagementService {
    constructor(private http: HttpClient) { }

    reserveitemByAdmin(reserveItem: ReserveItem | any): Observable<any> {
        return this.http.post(`/consoleApi/item/management/reserve-item-by-admin`, reserveItem);
    }

    getAllReservationsForItem(itemId: string): Observable<ItemManagement[]> {
        return this.http.get<ItemManagement[]>(`/consoleApi/item/management/get-reservations-by-item/${itemId}`);
    }

    getAllItemsReservations(itemIds:string[]){
        return this.http.post<ItemManagement[]>(`/consoleApi/item/management/get-all-item-reservations`,{itemIds});
    }

    getAllItemsReservationsForToday(itemIds:string[]){
        return this.http.post<ItemManagement[]>(`/consoleApi/item/management/get-all-item-reservations-for-today`,{itemIds});
    }

    markItemAsPaid(itemManagingId:string){
        return this.http.post<any>(`/consoleApi/item/management/mark-item-as-paid/${itemManagingId}`,{});
    }
    
}
