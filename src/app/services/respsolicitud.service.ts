import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RespsolicitudService {

  private endpoint = environment.apiUrl + environment.respuestasolicitudEndpoint;

  constructor(private http: HttpClient) {}

  getRespSolicitud(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token.replace('Bearer ', '')}` : ''
    });
    return this.http.get<any>(this.endpoint, { headers }).pipe(
      tap(data => console.log('Datos completos del endpoint:', data))
    );
  }
}
