import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private baseUrl = environment.apiUrl+ environment.cambiocarrera;

  constructor(private http: HttpClient) {}

  obtenerSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  responderSolicitud(id: number, payload: { action: string; responseComment: string }): Observable<any> {
    console.log('Solicitud respondida:', id, payload);
    return this.http.put(`${this.baseUrl}/${id}`, payload, {
      headers: this.getHeaders()

    });

  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
