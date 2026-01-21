import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$: Observable<any> = this.userSubject.asObservable();

  user!: any;
  constructor() {
    const storedUser = localStorage.getItem('schedule_user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    this.userSubject.next(parsedUser);
  }

  checkUser(): Observable<any> {
    try {
      const storedUser = localStorage.getItem('schedule_user');
      this.user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      this.user = null;
    }
    return this.user;
  }

  setUser(user: any) {
    this.userSubject.next(user);
    if (user) {
      localStorage.setItem('schedule_user', JSON.stringify(user));
      localStorage.setItem('schedule_token', JSON.stringify(user));
    } else {
      localStorage.removeItem('schedule_user');
      localStorage.removeItem('schedule_token');
    }
  }

  getUser(): any {
    return this.userSubject.value;
  }
}
