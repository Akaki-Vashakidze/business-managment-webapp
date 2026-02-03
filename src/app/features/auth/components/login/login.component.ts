import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  lang: string = 'en';
  email: string = '';
  password: string = '';
  errorMessage:string | null = null;

  constructor(private translateService: TranslateService, private userService:UserService, private router:Router,private authService:AuthService) {}

  changeLang(event: any) {
    const lang = event.target.value;
    this.translateService.use(lang);
  }

  onLogin() {
    this.errorMessage = null;
    this.authService.login(this.email,this.password).subscribe(item => {
      if(item.error) {
        this.errorMessage = item.keyword || 'Login failed';
      } else {
        localStorage.setItem('businesManagement_user', JSON.stringify(item));
        localStorage.setItem('businesManagement_role', item.user.isOwner || item.user.isManager ? 'admin' : 'user');
        localStorage.setItem('businesManagement_token', item.token)

        let route = item.user.isOwner == 1 || item.user.isManager == 1 ? 'admin/dashboard' : 'user/dashboard';
        this.router.navigate([route]);
        console.log('Login successful', item);
        this.userService.setUser(item);
      }
    })
  }
}
