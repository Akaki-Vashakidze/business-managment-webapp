import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../auth/services/user.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-header',
  imports: [CommonModule, MatButtonModule, TranslateModule, RouterModule, MatIconModule],
  templateUrl: './userHeader.component.html',
  styleUrl: './userHeader.component.scss'
})
export class UserHeaderComponent {
  lang: string = 'ka'
  user: any;
  private destroy$ = new Subject<void>();
  constructor(private translateService: TranslateService, private authService: AuthService, private userService: UserService, private router: Router) {
    const savedLang = localStorage.getItem('businesManagement_selectedLang') || 'ka';
    this.lang = savedLang;
    this.translateService.use(savedLang);
    try {
      const storedUser = localStorage.getItem('businesManagement_user');
      this.user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      this.user = null;
    }
    
    this.userService.user$.subscribe(item => {
      this.user = item;
    });

    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(item => {
        this.user = item;
        console.log('Header User Update:', this.user);
      });
  }

  changeLang(event: any) {
  const selectedLang = event.target.value;
  this.lang = selectedLang; // Keep the variable updated
  this.translateService.use(selectedLang);
  
  // Optional: Save to localStorage so it persists on refresh
  localStorage.setItem('businesManagement_selectedLang', selectedLang);
}

  switchRoleToAdmin(){
    this.userService.onSwitchRole('admin')
  }

  logOut(): void {
    this.authService.logOut()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.message) {
          this.userService.setUser(null);
          localStorage.removeItem('businesManagement_user');
          localStorage.removeItem('businesManagement_token');
          localStorage.removeItem('businesManagement_role');
          localStorage.removeItem('businesManagement_selectedBranch');
          localStorage.removeItem('businesManagement_selectedBusiness');
          this.router.navigate(['/login']);
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
