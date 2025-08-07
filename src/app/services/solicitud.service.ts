import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private baseUrl = 'http://localhost:1200/api/admin/change-career/requests';

  constructor(private http: HttpClient) {}

  obtenerSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  responderSolicitud(id: number, payload: { action: string; responceComment: string }): Observable<any> {
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
