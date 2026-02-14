import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BranchItem } from '../../../interfaces/shared-interfaces';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private http: HttpClient) {}
  getAnalyticsStats(): Observable<BranchItem[]> {
    return this.http.get<BranchItem[]>(
      `/consoleApi/analytics/stats`
    );
  }
}
