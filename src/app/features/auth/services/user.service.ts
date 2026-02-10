import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../../interfaces/shared-interfaces';
import { SKIP_LOADER } from './loading.interceptor';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$: Observable<any> = this.userSubject.asObservable();

  user!: any;
  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('businesManagement_user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    this.userSubject.next(parsedUser);
  }

  checkUser(): Observable<any> {
    try {
      const storedUser = localStorage.getItem('businesManagement_user');
      this.user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      this.user = null;
    }
    return this.user;
  }

  setUser(user: {user:User, token:string} | null) {
    this.userSubject.next(user);
    if (user) {
      localStorage.setItem('businesManagement_user', JSON.stringify(user.user));
      localStorage.setItem('businesManagement_token', user.token);
    } else {
      localStorage.removeItem('businesManagement_user');
      localStorage.removeItem('businesManagement_token');
    }
  }

  getUser(): any {
    return this.userSubject.value;
  }

  getAllUsers(businessId:string): Observable<any> {
    return this.http.get(`/consoleApi/admin/get-all-users-minus-owner-and-managers/${businessId}`);
  }

  getFilteredUsers(searchTerm: string, businessId:string): Observable<any> {
    return this.http.post(`/consoleApi/admin/get-filtered-users`, {searchQuery:searchTerm, businessId});
  }

  editUser(searchTerm: string, userData:any): Observable<any> {
    return this.http.put(`/consoleApi/user/edit`, {userData});
  }

    deleteUser(userId: string): Observable<any> {
    return this.http.delete(`/consoleApi/user/delete/${userId}`);
  }

    createMembership(userId: string, type:number, business:string, branch:string): Observable<any> {
      let branches : any = [];
      branch != '' ? branches = [branch] : branches = [];
      let body = { userId, type , business, branches}
    return this.http.post(`/consoleApi/membership/create`, body);
  }

    addUser(userId: string): Observable<any> {
    return this.http.post(`/consoleApi/user/create`, {userId});
  }
  
  getUserById(userId:string){
    return this.http.get<any>(`/consoleApi/user/getById/${userId}`);
  }

  makeAdminActive(){
    return this.http.post(`/consoleApi/admin/makeAdminActive`, {});
  }

  checkIfAdminIsActive(){
    return this.http.post(`/consoleApi/admin/checkIfAdminIsActive`, {},{
            context: new HttpContext().set(SKIP_LOADER, true)
        });
  }

  blockUser(userId:string){
    return this.http.post(`/consoleApi/admin/blockUser/${userId}`, {});
  }

  unblockUser(userId:string){
    return this.http.post(`/consoleApi/admin/unblockUser/${userId}`, {});
  }
}
