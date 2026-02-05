import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Business, ItemManagement, ReserveItem } from '../../../interfaces/shared-interfaces';
import { SKIP_LOADER } from './loading.interceptor';

@Injectable({
    providedIn: 'root'
})
export class SiteService {
    constructor(private http: HttpClient) { }

    reserveitem(reserveItem: ReserveItem | any): Observable<any> {
        return this.http.post(`/consoleApi/item/management/reserve-item-by-user`, reserveItem);
    }

    getBranchesByBusiness(business: string): Observable<ItemManagement[]> {
        return this.http.get<ItemManagement[]>(`/consoleApi/site/get-business-branches/${business}`);
    }

    getItemsReservations(body:{date:string,branchId:string}){
        return this.http.post<ItemManagement[]>(`/consoleApi/site/get-branch-items-reservations`,body,{
            context: new HttpContext().set(SKIP_LOADER, true)
        });
    }

    getMyReservations(): Observable<ItemManagement[]> {
        return this.http.get<ItemManagement[]>(`/consoleApi/site/get-my-reservations`);
    }

    deleteMyReservation(id:string) {
        return this.http.delete<any>(`/consoleApi/site/delete-my-reservation/${id}`);
    }
    
}
