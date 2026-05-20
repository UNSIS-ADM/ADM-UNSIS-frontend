import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = localStorage.getItem('token') || '';
  if (!token) return next(req);

  

  const headerValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  const clonedReq = req.clone({
    setHeaders: { Authorization: headerValue },
  });
  return next(clonedReq);
};

