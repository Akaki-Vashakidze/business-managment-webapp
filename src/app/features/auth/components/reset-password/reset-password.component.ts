import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { SnackbarService } from '../../services/snack-bar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss' 
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  password = '';
  confirmPassword = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    private snackbar: SnackbarService,
    private router: Router,
    private authService:AuthService
  ) {}

ngOnInit() {
  // Use params instead of queryParams for path variables (:token)
  this.token = this.route.snapshot.params['token'];
  
  console.log('Token is:', this.token); // Should now log "fassa"

  if (!this.token) {
    this.snackbar.error('Invalid link. Please request a new one.');
    this.router.navigate(['/password-recovery']); // Fixed path name
  }
}

  updatePassword() {
    if (this.password !== this.confirmPassword) return this.snackbar.error('Passwords mismatch');
    if (this.password.length < 6) return this.snackbar.error('Too short');

    this.loading = true;
    this.authService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.snackbar.success('Success! Login with your new password.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.snackbar.error(err.error?.message || 'Session expired');
      }
    });
  }
}