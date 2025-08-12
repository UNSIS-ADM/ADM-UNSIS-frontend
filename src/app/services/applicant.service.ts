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

  changeCareer(newCareer: string, requestComment: string): Observable<any> {
    const body = {
      newCareer: newCareer,
      requestComment: requestComment
    };

    // Obtén el token del localStorage (o sessionStorage según tu app)
    const token = localStorage.getItem('token');

    // Configura headers con autorización
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log(this.apiUrl); // Para depurar

    // Envía la petición con los headers
    return this.http.post(`${this.apiUrl}/change-career`, body, { headers });
  }
}
