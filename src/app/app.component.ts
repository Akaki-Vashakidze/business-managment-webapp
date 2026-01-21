import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./sharedComponents/header/header.component";
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { en } from './i18n/en';
import { ka } from './i18n/ka';
import { LoaderComponent } from './sharedComponents/loader/loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent,LoaderComponent, HeaderComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    this.translate.setTranslation('en', en);
    this.translate.setTranslation('ka', ka);

    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  title = 'scheduler-app';

}
