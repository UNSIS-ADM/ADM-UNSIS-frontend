import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private endpoint = environment.apiUrl + environment.getalumnosEndpoint;
  private endpointget = environment.apiUrl + environment.getApplicantbyid;
  private pdfEndpoint = environment.apiUrl + environment.generatePdfEndpoint;

  constructor(private http: HttpClient) {}

  getAlumnos(page: number, size: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token.replace('Bearer ', '')}` : '',
    });
    return this.http.get<any>(`${this.endpoint}?page=${page}&size=${size}`, { headers });
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
    return this.http.post<any>(`${this.endpoint}/${id}/attendance`, data, { headers });
  }

  // 🔹 Trae el JSON estructurado con el PDF y el Excel incluidos
generatePdfReport(): Observable<Blob> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: token ? `Bearer ${token.replace('Bearer ', '')}` : '',
  });
  
  if (!this.pdfEndpoint || this.pdfEndpoint.includes('undefined')) {
    console.error("🚨 Error: 'environment.generatePdfEndpoint' no está configurado.");
  }

  // Retornamos un Blob (Binary Large Object) que representa nuestro ZIP
  return this.http.get(this.pdfEndpoint, { 
    headers, 
    responseType: 'blob' 
  });
}

  searchAlumnos(params: any, page: number, size: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token.replace('Bearer ', '')}` : '',
    });

    let queryParams: any = { page, size };
    if (params.year) queryParams.year = params.year;
    if (params.career) queryParams.career = params.career;
    if (params.status) queryParams.status = params.status;
    if (params.search) queryParams.search = params.search;

    return this.http.get<any>(`${this.endpoint}/search`, { headers, params: queryParams });
  }

  getCareers(): Observable<string[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token.replace('Bearer ', '')}` : '',
    });
    return this.http.get<string[]>(`${this.endpoint}/careers`, { headers });
  }
}