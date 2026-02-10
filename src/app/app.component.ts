import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { en } from './i18n/en';
import { ka } from './i18n/ka';
import { LoaderComponent } from './sharedComponents/loader/loader.component';
import { AdminHeaderComponent } from './features/admin/admin-header/adminHeader.component';
import { UserHeaderComponent } from './features/user/user-header/userHeader.component';
import { UserService } from './features/auth/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, CommonModule, TranslateModule, AdminHeaderComponent, UserHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  adminView: any;
  constructor(private translate: TranslateService, private userService: UserService) {
    userService.user$.subscribe(item => {
      console.log('App Component User Update:', item);
      if(!item) {
        this.adminView = false;
      } else {
        this.adminView = item.user.isManager == 1 || item.user.isOwner == 1 ? true : false;
      }
    });
    this.translate.setTranslation('en', en);
    this.translate.setTranslation('ka', ka);

    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  title = 'scheduler-app';

}
