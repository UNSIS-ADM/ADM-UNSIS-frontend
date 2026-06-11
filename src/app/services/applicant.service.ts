import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicantService {

  private apiUrl = environment.apiUrl + environment.cambiodecarreraEndpoint;

  constructor(private http: HttpClient) { }

  // 🔹 Método para obtener headers con token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // o sessionStorage según tu caso
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ Enviar solicitud de cambio de carrera
  changeCareer(newCareer: string, requestComment: string): Observable<any> {
    const body = {
      newCareer: newCareer,
      requestComment: requestComment
    };

    console.log(this.apiUrl);
    console.log("nueva carrera", newCareer);

    return this.http.post(`${this.apiUrl}/change-career`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ Obtener vacantes disponibles con token
  getVacantesDisponibles(): Observable<any[]> {
    const url = environment.apiUrl + environment.available ;
    return this.http.get<any[]>(url, {
      headers: this.getAuthHeaders(),
    });
  }
}
