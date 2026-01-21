import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  lang: string = 'en';
  email: string = '';
  code: string = '';
  password: string = '';
  password2: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  step1: boolean = true;
  step2: boolean = false;
  step3: boolean = false;
  countDownSeconds: number = 120;
  interval!: any;

  constructor(private translateService: TranslateService, private router: Router, private authService: AuthService) {
    this.startCountDown()
  }

  changeLang(event: any) {
    const lang = event.target.value;
    this.translateService.use(lang);
  }

  sendVerificationCodeEmail() {
    this.resetResponceMessages()
    this.email = this.email;
    this.authService.sendVerificationCode(this.email).subscribe(item => {
      if (!item.error) {
        let success = item?.result?.data;
        if (success) {
          if (success.alreadySent) {
            this.errorMessage = success.message;
          } else {
            this.successMessage = 'Code Sent'
            setTimeout(() => {
              this.step1 = false;
              this.step2 = true;
              this.startCountDown()
            }, 1000);
          }
        } else {
          this.errorMessage = 'Error ocured'
        }
      } else {
        this.errorMessage = item.keyword
      }

    })
  }

  confirmCode() {
    this.resetResponceMessages()
    console.log(this.email, this.code)
    this.authService.confirmCode(this.email, this.code).subscribe(item => {
      if (item.result.data) {
        this.successMessage = 'Code confirmed';
        setTimeout(() => {
          this.step1 = false;
          this.step2 = false;
          this.step3 = true;
        }, 1000);
      } else {
        this.errorMessage = 'Error ocured'
      }
    })
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
    this.resetResponceMessages()
    if (this.password === this.password2) {
      this.authService.signUp(this.email, this.password, this.code).subscribe(item => {
        console.log(item)
        if (item.error) {
          this.errorMessage = item.keyword || 'Login failed';
        } else {
          this.router.navigate(['dashboard'])
          localStorage.setItem('user', item)
        }
      })
    } else {
      this.errorMessage = 'Passwords do not match.'
    }

  }
}

