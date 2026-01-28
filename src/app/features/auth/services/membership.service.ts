import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ItemManagement } from '../../../interfaces/shared-interfaces';

@Injectable({ providedIn: 'root' })
export class MembershipService {

  constructor(private http: HttpClient) {}

  checkIn(qr: string, business:string, branch:string,itemManagementData:ItemManagement) {
    return this.http.post<any>('/consoleApi/membership/check-in', {
      qr,
      business,
      branch,
      itemManagementData
    });
  }
}