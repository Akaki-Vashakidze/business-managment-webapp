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
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, TranslateModule, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit, OnDestroy {
  lang: string = 'en';
  mobileNumber: string = '';
  code: string = '';
  fullName: string = '';
  password: string = '';
  password2: string = '';
  
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
    this.getAllbusinesses();
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  getAllbusinesses() {
    this.businessService.getAllBusinesses().subscribe(res => {
      this.businesses = res;
      // Auto-select if only one business exists
      if (this.businesses && this.businesses.length === 1) {
        this.selectedBusinessId = this.businesses[0]._id;
      }
    });
  }

  sendVerificationCodeMobileMessage() {
    if (!this.selectedBusinessId) {
      this.errorMessage = 'Please select a business card above';
      return;
    }
    this.resetResponceMessages();
    this.authService.sendVerificationCodeMobileMessage(this.mobileNumber).subscribe(item => {
      if (!item.error) {
        let success = item?.result?.data;
        if (success) {
          if (success.alreadySent) {
            this.errorMessage = success.message;
          } else {
            this.successMessage = 'Code Sent';
              this.step1 = false;
              this.step2 = true;
              this.countDownSeconds = 120;
              this.startCountDown();
          }
        }
      } else {
        this.errorMessage = item.keyword;
      }
    });
  }

  confirmCode() {
    this.resetResponceMessages();
    this.authService.confirmCodeMobileMessage(this.mobileNumber, this.code).subscribe(item => {
      if (item.result.data) {
        this.successMessage = 'Code confirmed';
          this.step1 = false;
          this.step2 = false;
          this.step3 = true;
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
      if (this.countDownSeconds <= 0 && !this.step3) {
        this.step1 = true;
        this.step2 = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }

  signUp() {
    this.resetResponceMessages();
    if (this.password === this.password2) {
      this.authService.signUp(
        this.mobileNumber, 
        this.password, 
        this.code, 
        this.fullName, 
        this.selectedBusinessId
      ).subscribe(item => {
        if (item.error) {
          this.errorMessage = item.keyword || 'Registration failed';
        } else {
          this.userService.setUser(item);
          this.router.navigate(['dashboard']);
        }
      });
    } else {
      this.errorMessage = 'Passwords do not match.';
    }
  }
}