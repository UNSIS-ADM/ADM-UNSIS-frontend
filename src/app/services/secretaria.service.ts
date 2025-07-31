import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SecretariaService {
  private apiUrl = environment.apiUrl;
  private registerEndpoint = '/auth/users'; // Ajusta según tu backend

  constructor(private http: HttpClient) { }

  registrarSecretaria(secretariaData: any): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Datos enviados:', secretariaData)
  console.log('Token de autorización:', Response);
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token.replace('Bearer ', '')}` : '',
      'Content-Type': 'application/json'
    });

    return this.http.post(
      `${this.apiUrl}${this.registerEndpoint}`,
      secretariaData,
      { headers , responseType: 'text'},
      
    );
  }
}