import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`/consoleApi/auth/login`, body);
  }

  signUp(mobileNumber: string, password: string, code:string, fullName: string, business:string): Observable<any> {
    const body = { mobileNumber, password, code, fullName, business };
    return this.http.post(`/consoleApi/auth/signup`, body);
  }

  sendVerificationCode(email: string): Observable<any> {
    const body = { email };
    return this.http.post(`/consoleApi/auth/sendVerificationCodeEmail`, body);
  } 

  sendVerificationCodeMobileMessage(email: string): Observable<any> {
    const body = { email };
    return this.http.post(`/consoleApi/auth/sendVerificationCodeMessage`, body);
  } 

  confirmCode(email:string,code: string): Observable<any> {
    const body = { email, code };
    return this.http.post(`/consoleApi/auth/confirmCodeEmail`, body);
  }

  confirmCodeMobileMessage(mobileNumber:string,code: string): Observable<any> {
    const body = { mobileNumber, code };
    return this.http.post(`/consoleApi/auth/confirmCodeMobileNumber`, body);
  }

  forgotPassword(number:string): Observable<any> {
    let mobileNumber = JSON.parse(number)
    const body = { mobileNumber };
    return this.http.post(`/consoleApi/auth/forgot-password`, body);
  }

  resetPassword(accessToken:string, newPassword:string): Observable<any> {
    const body = { accessToken, newPassword };
    return this.http.post(`/consoleApi/auth/reset-password`, body);
  }

  logOut(){ 
    return this.http.post(`/consoleApi/auth/logout`, {});
  }
  
}
