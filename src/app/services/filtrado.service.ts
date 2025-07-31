
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltradoService {
  private baseUrl = 'http://localhost:1200/api/applicants';

  constructor(private http: HttpClient) { }

  buscar(termino: string): Observable<any[]> {
    if (!termino.trim()) {
      return of([]); // Retorna observable vacío si no hay término
    }

    const params = new HttpParams().set('search', termino);
    return this.http.get<any[]>(`${this.baseUrl}/search`, { params }).pipe(
      catchError(() => of([])) // Maneja errores devolviendo array vacío
    );
  }
}