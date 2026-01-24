import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const role = localStorage.getItem('businesManagement_role'); 
    if (role !== 'admin') {
      this.router.navigate(['/user/dashboard']);
      return false;
    }
    return true;
  }
}
