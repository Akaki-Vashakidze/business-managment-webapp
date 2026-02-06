import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../auth/services/user.service';
import { BranchesComponent } from '../../../sharedComponents/branches/branches.component';
import { AdminSettingsComponent } from "../admin-settings/admin-settings.component";
import { BusinessesComponent } from "../businesses/businesses.component";

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    TranslateModule, 
    BusinessesComponent, 
    RouterModule, 
    BranchesComponent, 
    AdminSettingsComponent
  ],
  templateUrl: './adminHeader.component.html',
  styleUrl: './adminHeader.component.scss'
})
export class AdminHeaderComponent implements OnDestroy {
  user: any;
  private destroy$ = new Subject<void>();

  constructor(
    private translateService: TranslateService, 
    private authService: AuthService, 
    private userService: UserService, 
    private router: Router
  ) {
    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(item => {
        this.user = item;
      });
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