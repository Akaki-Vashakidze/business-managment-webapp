import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SnackbarService } from './snack-bar.service';

@Injectable()
export class BadRequestInterceptor implements HttpInterceptor {
  constructor(private snackbarService: SnackbarService){}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap({
        next: event => {
          if (event instanceof HttpResponse) {
            let statusCode = event.body.statusCode
            if(statusCode == 400 || statusCode == 404) {
              let errorT = event.body.errors;
              this.snackbarService.error(errorT)
            }
          }
        },
        error: err => {
          if (err instanceof HttpErrorResponse) {
            if(err.error.statusCode == 400){
              let errorT = err.error.message[0].split('.0.')[1] || err.error.message[0] ||  'Error';
              this.snackbarService.error(errorT)
            }
          }
        }
      })
    );
  }
}
