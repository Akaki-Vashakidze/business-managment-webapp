import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Business } from '../../../interfaces/shared-interfaces';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  public businessesUpdated = new BehaviorSubject<boolean>(false);
  public businessSelected = new BehaviorSubject<Business | null>(null);
  constructor(private http: HttpClient) { }

  createBusiness(name:string): Observable<any> {
    const body = { name };
    return this.http.post(`/consoleApi/business/create-business`, body);
  }

  selectBusiness(business: Business) {
    this.businessSelected.next(business);
  }

  onBusinessesUpdated() {
    return this.businessesUpdated.next(true);
  }

  getAllMyBusinesses(): Observable<any> {
    return this.http.get(`/consoleApi/business/get-all-my-businesses`);
  }

  deletebusiness(businessId: string): Observable<any> {
    return this.http.delete(`/consoleApi/business/delete-business/${businessId}`);
  }

  updateBusiness(businessId: string, name: string): Observable<any> {
    const body = { name };
    return this.http.put(`/consoleApi/business/update-business/${businessId}`, body);
  }

  addbranchToBusiness(businessId: string, branchName: string): Observable<any> {
    const body = { businessId, branchName };
    return this.http.post(`/consoleApi/business/add-branch-to-business`, body);
  }
}
