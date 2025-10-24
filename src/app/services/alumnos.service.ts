// alumnos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private endpoint = environment.apiUrl + environment.getalumnosEndpoint;
  private endpointget = environment.apiUrl + environment.getApplicantbyid;
  private pdfEndpoint = 'http://localhost:1200/api/admin/generate-pdf'; // Endpoint para PDF

  constructor(private http: HttpClient) { }

  getAlumnos(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token.replace('Bearer ', '')}` : ''
    });
    return this.http.get<any[]>(this.endpoint, { headers });
  }

  getApplicantById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token.replace('Bearer ', '')}` : ''
    });
    return this.http.get<any>(`${this.endpointget}/${id}`, { headers });
  }

  editApplicantById(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
    return this.http.patch<any>(`${this.endpointget}/${id}`, data, { headers });
  }

  marcarAsistencia(id: number, data: { status: string }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.endpoint}/${id}/attendance`, data, { headers });
  }

  // ✅ Nuevo método para generar PDF
  generatePdfReport(): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
    return this.http.get(this.pdfEndpoint, { headers, responseType: 'blob' });
  }
}
