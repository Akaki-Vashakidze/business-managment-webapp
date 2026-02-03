import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/user.service';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit, OnDestroy {
  lang: string = 'en';
  email: string = '';
  code: string = '';
  fullName: string = '';
  password: string = '';
  mobileNumberIndex: string = '';
  mobileNumber: string = '';
  password2: string = '';
  
  // New properties for business selection
  businesses: any[] = [];
  selectedBusinessId: string = '';

  errorMessage: string | null = null;
  successMessage: string | null = null;
  step1: boolean = true;
  step2: boolean = false;
  step3: boolean = false;
  countDownSeconds: number = 120;
  interval!: any;

  constructor(
    private translateService: TranslateService, 
    private businessService: BusinessService, 
    private userService: UserService, 
    private router: Router, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.startCountDown();
    this.getAllbusinesses();
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  getAllbusinesses() {
    this.businessService.getAllBusinesses().subscribe(res => {
      // Assuming res is the array of businesses you provided
      this.businesses = res;
    });
  }

  changeLang(event: any) {
    const lang = event.target.value;
    this.translateService.use(lang);
  }

  sendVerificationCodeEmail() {
    if (!this.selectedBusinessId) {
      this.errorMessage = 'Please select a business card above';
      return;
    }
    this.resetResponceMessages();
    this.authService.sendVerificationCode(this.email).subscribe(item => {
      if (!item.error) {
        let success = item?.result?.data;
        if (success) {
          if (success.alreadySent) {
            this.errorMessage = success.message;
          } else {
            this.successMessage = 'Code Sent';
            setTimeout(() => {
              this.step1 = false;
              this.step2 = true;
              this.countDownSeconds = 120; // Reset timer
              this.startCountDown();
            }, 1000);
          }
        } else {
          this.errorMessage = 'Error occurred';
        }
      } else {
        this.errorMessage = item.keyword;
      }
    });
  }

  confirmCode() {
    this.resetResponceMessages();
    this.authService.confirmCode(this.email, this.code).subscribe(item => {
      if (item.result.data) {
        this.successMessage = 'Code confirmed';
        setTimeout(() => {
          this.step1 = false;
          this.step2 = false;
          this.step3 = true;
        }, 1000);
      } else {
        this.errorMessage = 'Invalid code';
      }
    });
  }

  resetResponceMessages() {
    this.successMessage = null;
    this.errorMessage = null;
  }

  startCountDown(): void {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.countDownSeconds--;
      if (this.countDownSeconds <= 0) {
        this.step1 = true;
        this.step2 = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }

  signUp() {
    this.resetResponceMessages();
    if (this.password === this.password2) {
      const fullMobile = this.mobileNumberIndex + this.mobileNumber;
      
      // Pass selectedBusinessId as the last argument
      this.authService.signUp(
        this.email, 
        this.password, 
        this.code, 
        this.fullName, 
        fullMobile, 
        this.selectedBusinessId
      ).subscribe(item => {
        if (item.error) {
          this.errorMessage = item.keyword || 'Registration failed';
        } else {
          localStorage.setItem('businesManagement_user', JSON.stringify(item));
          localStorage.setItem('businesManagement_role', item.user.isOwner == 1 || item.user.isManager == 1 ? 'admin' : 'user');
          localStorage.setItem('businesManagement_token', item.token);
          this.userService.setUser(item);
          this.router.navigate(['dashboard']);
        }
      });
    } else {
      this.errorMessage = 'Passwords do not match.';
    }
  }
}