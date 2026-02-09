import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { SnackbarService } from '../../services/snack-bar.service';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pass-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './pass-recovery.component.html',
  styleUrl: './pass-recovery.component.scss'
})
export class PassRecoveryComponent {
  currentStep: number = 1;
  loading: boolean = false;

  recoveryData = {
    phone: '',
    token: '' // Your backend calls it 'token' in the URL link
  };

  constructor(
    private siteService: SiteService,
    private snackbar: SnackbarService,
    private router: Router,
    private authService:AuthService
  ) {}

  sendCode() {
    if (!this.recoveryData.phone) return this.snackbar.error('Enter phone number');
    
    this.loading = true;
    this.authService.forgotPassword(this.recoveryData.phone).subscribe({
      next: (res: any) => {
        this.loading = false;
        // this.currentStep = 2;
        this.snackbar.success('If registered, a reset link was sent.');
        this.router.navigate(['/login'])
      },
      error: (err) => {
        this.loading = false;
        this.snackbar.error(err.error?.message || 'Error sending SMS');
      }
    });
  }

  verifyCode() {
    if (!this.recoveryData.token) return this.snackbar.error('Enter the reset token');
    // Navigate to the reset page with the token as a query parameter
    this.router.navigate(['/reset-password'], { 
      queryParams: { token: this.recoveryData.token } 
    });
  }
}