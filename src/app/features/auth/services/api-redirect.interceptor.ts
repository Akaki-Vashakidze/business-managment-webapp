
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export const consoleApiRedirectInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/consoleApi/')) {
    const modifiedUrl = req.url.replace('/consoleApi', environment.apiUrl);
    const modifiedReq = req.clone({ url: modifiedUrl });
    return next(modifiedReq);
  }
  return next(req);
};
