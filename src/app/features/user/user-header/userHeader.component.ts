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
  lang: string = 'en'
  user: any;
  private destroy$ = new Subject<void>();
  constructor(private translateService: TranslateService, private authService: AuthService, private userService: UserService, private router: Router) {
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
    let lang = event.target.value
    this.translateService.use(lang);
  }

  logOut(): void {
    this.authService.logOut()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.message) {
          this.userService.setUser(null);
          localStorage.removeItem('businesManagement_user');
          localStorage.removeItem('businesManagement_token');
          this.router.navigate(['/login']);
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
