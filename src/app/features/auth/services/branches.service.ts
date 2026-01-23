import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Branch } from '../../../interfaces/shared-interfaces';

@Injectable({
  providedIn: 'root'
})
export class BranchesService {
  public BranchesUpdate = new BehaviorSubject<boolean>(false);
  public selectedBranch = new BehaviorSubject<Branch | null>(null);

  constructor(private http: HttpClient) { }

  createBranch(name:string, business:string): Observable<any> {
    const body = { name, business };
    return this.http.post(`/consoleApi/Branch/create-Branch`, body);
  }

  onSelectedBranch(branch: Branch) {
    this.selectedBranch.next(branch);
  }

  onBranchesUpdate() {
    return this.BranchesUpdate.next(true);
  }

  getBranchesByBusiness(businessId: string): Observable<any> {
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
