import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpContextToken
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoadingService } from './loading.service';

/**
 * We create a Token that can be passed in the HTTP Context.
 * Default value is 'false' (loader will show by default).
 */
export const SKIP_LOADER = new HttpContextToken<boolean>(() => false);

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    if (req.context.get(SKIP_LOADER) === true) {
      return next.handle(req);
    }

    this.loadingService.show();

    return next.handle(req).pipe(
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }
}