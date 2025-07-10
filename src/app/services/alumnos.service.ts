import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private endpoint = environment.apiUrl + environment.getalumnosEndpoint;

  constructor(private http: HttpClient) {}

  getAlumnos(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token.replace('Bearer ', '')}` : ''
    });
    return this.http.get<any[]>(this.endpoint, { headers });
  }
}
