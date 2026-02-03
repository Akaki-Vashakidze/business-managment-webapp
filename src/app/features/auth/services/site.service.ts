import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Business, ItemManagement, ReserveItem } from '../../../interfaces/shared-interfaces';

@Injectable({
    providedIn: 'root'
})
export class SiteService {
    constructor(private http: HttpClient) { }

    reserveitem(reserveItem: ReserveItem | any): Observable<any> {
        return this.http.post(`/consoleApi/item/management/reserve-item`, reserveItem);
    }

    getBranchesByBusiness(business: string): Observable<ItemManagement[]> {
        return this.http.get<ItemManagement[]>(`/consoleApi/site/get-business-branches/${business}`);
    }

    getItemsReservations(branchId:string){
        return this.http.get<ItemManagement[]>(`/consoleApi/site/get-branch-items-reservations/${branchId}`);
    }
    
}
