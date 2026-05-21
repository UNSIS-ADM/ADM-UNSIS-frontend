// alumnos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private endpoint = environment.apiUrl + environment.getalumnosEndpoint;
  private endpointget = environment.apiUrl + environment.getApplicantbyid;
  private pdfEndpoint = environment.apiUrl + environment.generatePdfEndpoint; // Endpoint para PDF

  constructor(private http: HttpClient) {}

  getAlumnos(page: number, size: number): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token.replace('Bearer ', '')}` : '',
    });

    return this.http.get<any>(`${this.endpoint}?page=${page}&size=${size}`, {
      headers,
    });
  }

  getApplicantById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token.replace('Bearer ', '')}` : '',
    });
    return this.http.get<any>(`${this.endpointget}/${id}`, { headers });
  }

  editApplicantById(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
    return this.http.patch<any>(`${this.endpointget}/${id}`, data, { headers });
  }

  marcarAsistencia(id: number, data: { status: string }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(`${this.endpoint}/${id}/attendance`, data, {
      headers,
    });
  }

  // ✅ Nuevo método para generar PDF
  generatePdfReport(): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    return this.http.get(this.pdfEndpoint, { headers, responseType: 'blob' });
  }

  searchAlumnos(params: any, page: number, size: number): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token.replace('Bearer ', '')}` : '',
    });

    let queryParams: any = {
      page,
      size,
    };

    // Año
    if (params.year) {
      queryParams.year = params.year;
    }

    // Carrera
    if (params.career) {
      queryParams.career = params.career;
    }

    // Status
    if (params.status) {
      queryParams.status = params.status;
    }

    // Texto de búsqueda
    if (params.search) {
      queryParams.search = params.search;
    }

    return this.http.get<any>(`${this.endpoint}/search`, {
      headers,
      params: queryParams,
    });
  }

  getCareers(): Observable<string[]> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token.replace('Bearer ', '')}` : '',
    });

    return this.http.get<string[]>(`${this.endpoint}/careers`, {
      headers,
    });
  }
}
