import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class IsAlreadyAuthedGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('businesManagement_token');
    if (token) {
      const role = localStorage.getItem('businesManagement_role'); 
      if(role == 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if(role == 'user') {
        this.router.navigate(['/user/dashboard']);
      }
      return false;
    }
    return true;
  }
}
