import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo interceptamos peticiones al endpoint de content
    if (request.url.includes('/api/content')) {
      console.log('Request:', {
        url: request.url,
        method: request.method,
        body: request.body
      });
    }

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.url?.includes('/api/content')) {
          console.log('Response:', {
            url: event.url,
            status: event.status,
            body: event.body
          });
        }
      })
    );
  }
}