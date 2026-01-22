import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

import { HttpClientModule, HttpClient, provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { consoleApiRedirectInterceptor } from './features/auth/services/api-redirect.interceptor';
import { LoadingInterceptor } from './features/auth/services/loading.interceptor';
import { TokenInterceptorService } from './features/auth/services/token.interceptor';
import { BadRequestInterceptor } from './features/auth/services/bad-request.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    importProvidersFrom(HttpClientModule),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BadRequestInterceptor,
      multi:true
    },
    // {
    //   provide: ErrorHandler,
    //   useClass: GlobalErrorHandler
    // },
    provideHttpClient(withInterceptors([consoleApiRedirectInterceptor])),
    provideRouter(routes, withHashLocation())
  ],
};
