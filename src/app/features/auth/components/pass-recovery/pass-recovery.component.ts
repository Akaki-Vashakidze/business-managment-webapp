import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { SnackbarService } from '../../services/snack-bar.service';

@Component({
  selector: 'app-pass-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pass-recovery.component.html',
  styleUrl: './pass-recovery.component.scss'
})
export class PassRecoveryComponent {
  // Step tracking: 1 = Identity, 2 = OTP Code, 3 = New Password
  currentStep: number = 1;
  loading: boolean = false;

  // Data Models
  recoveryData = {
    phone: '',
    code: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private siteService: SiteService,
    private snackbar: SnackbarService,
    private router: Router
  ) {}

  // STEP 1: Send SMS
  sendCode() {
    if (!this.recoveryData.phone) return this.snackbar.error('Enter phone number');
    this.loading = true;
    // this.siteService.sendRecoverySms(this.recoveryData.phone).subscribe({
    //   next: () => {
        this.currentStep = 2;
        this.loading = false;
        this.snackbar.success('Code sent to ' + this.recoveryData.phone);
    //   },
    //   error: (err) => { this.loading = false; this.snackbar.error(err.error?.message); }
    // });
  }

  // STEP 2: Verify OTP
  verifyCode() {
    if (this.recoveryData.code.length < 4) return this.snackbar.error('Enter valid code');
    this.loading = true;
    // this.siteService.verifyRecoveryCode(this.recoveryData.phone, this.recoveryData.code).subscribe({
    //   next: () => {
        this.currentStep = 3;
        this.loading = false;
    //   },
    //   error: (err) => { this.loading = false; this.snackbar.error('Invalid Code'); }
    // });
  }

  // STEP 3: Save New Password
  resetPassword() {
    if (this.recoveryData.password !== this.recoveryData.confirmPassword) {
      return this.snackbar.error('Passwords do not match!');
    }
    if (this.recoveryData.password.length < 6) {
      return this.snackbar.error('Password too short!');
    }

    this.loading = true;
    // this.siteService.updatePassword(this.recoveryData).subscribe({
    //   next: () => {
        this.snackbar.success('Password updated! Redirecting...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
    //   },
    //   error: (err) => { this.loading = false; this.snackbar.error('Update failed'); }
    // });
  }
}