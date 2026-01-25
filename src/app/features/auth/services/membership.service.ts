import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MembershipService {

  constructor(private http: HttpClient) {}

  checkIn(qr: string) {
    return this.http.post<any>('/consoleApi/membership/check-in', {
      qr
    });
  }
}