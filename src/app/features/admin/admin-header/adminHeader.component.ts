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
import { MatIconModule } from "@angular/material/icon";

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
    AdminSettingsComponent,
    MatIconModule
  ],
  templateUrl: './adminHeader.component.html',
  styleUrl: './adminHeader.component.scss'
})
export class AdminHeaderComponent implements OnDestroy {
  user: any;
  private destroy$ = new Subject<void>();
  intervalAdminActive:any;

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

    this.intervalAdminActive = setInterval(() => {
      this.userService.checkIfAdminIsActive().subscribe(item => {
        item ? this.user.isActiveAdmin = 1: this.user.isActiveAdmin = 0;
      })
    }, 30000);
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

  makeAdminActive() {
    this.userService.makeAdminActive().subscribe(item => {
      this.user = item;
    })
  }

  changeLang(event: any) {
    let lang = event.target.value
    this.translateService.use(lang);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.intervalAdminActive);
  }
}