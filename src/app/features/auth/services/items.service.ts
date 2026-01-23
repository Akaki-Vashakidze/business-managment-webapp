import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BranchItem } from '../../../interfaces/shared-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private itemsUpdated = new BehaviorSubject<boolean>(false);
  itemsUpdated$ = this.itemsUpdated.asObservable();

  constructor(private http: HttpClient) {}

  createItem(name: string, branch: string): Observable<any> {
    const body = { name, branch };
    return this.http.post(`/consoleApi/item/create-item`, body);
  }

  getItemsByBranch(branchId: string): Observable<BranchItem[]> {
    return this.http.get<BranchItem[]>(
      `/consoleApi/item/get-items-by-branch/${branchId}`
    );
  }

  updateItem(itemId: string, name: string): Observable<any> {
    const body = { name };
    return this.http.put(
      `/consoleApi/item/update-item/${itemId}`,
      body
    );
  }

  deleteItem(itemId: string): Observable<any> {
    return this.http.delete(
      `/consoleApi/item/delete-item/${itemId}`
    );
  }

  notifyItemsUpdated() {
    this.itemsUpdated.next(true);
  }
}
