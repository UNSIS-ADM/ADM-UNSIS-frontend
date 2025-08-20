// src/app/interceptors/token.interceptor.ts


import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = localStorage.getItem('token') || '';
  if (!token) return next(req);
  console.debug('authInterceptor token found?', !!token, req.url);


  const headerValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  const clonedReq = req.clone({
    setHeaders: { Authorization: headerValue },
  });
  return next(clonedReq);
};
