import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchesService {
  public BranchesUpdate = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) { }

  createBranch(name:string, business:string): Observable<any> {
    const body = { name, business };
    return this.http.post(`/consoleApi/Branch/create-Branch`, body);
  }

  onBranchesUpdate() {
    return this.BranchesUpdate.next(true);
  }

  getBranchesByBusiness(businessId: string): Observable<any> {
    console.log('Fetching branches for business ID:', businessId);
    return this.http.get(`/consoleApi/Branch/get-branches-by-business/${businessId}`);
  }
  
  deleteBranch(BranchId: string): Observable<any> {
    return this.http.delete(`/consoleApi/Branch/delete-Branch/${BranchId}`);
  }

  updateBranch(BranchId: string, name: string): Observable<any> {
    const body = { name };
    return this.http.put(`/consoleApi/Branch/update-Branch/${BranchId}`, body);
  }

  addbranchToBranch(BranchId: string, branchName: string): Observable<any> {
    const body = { BranchId, branchName };
    return this.http.post(`/consoleApi/Branch/add-branch-to-Branch`, body);
  }
}
