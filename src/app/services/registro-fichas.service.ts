import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegistroFichasService {
  private baseUrl = 'http://localhost:1200/api/admin/vacancies';

  constructor(private http: HttpClient) {}

  registrar(carrera: string, year: number, limit: number): Observable<any> {
    const carreraCodificada = encodeURIComponent(carrera.toUpperCase());
    const url = `${this.baseUrl}/${carreraCodificada}`;
    const params = new HttpParams()
      .set('year', year.toString())
      .set('limit', limit.toString());

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    console.log(`Registrando fichas para ${url} en el año ${year} con límite ${limit}`);

    return this.http.put(url, null, { params, headers });
  }
}
