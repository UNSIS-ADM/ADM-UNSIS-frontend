import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FiltradoService {
  private baseUrl = environment.apiUrl + environment.getalumnosEndpoint;

  constructor(private http: HttpClient) { }

  buscar(termino: string, tipo: 'curp' | 'ficha' | 'fullName' | 'career'): Observable<any[]> {
    if (!termino.trim()) {
      return of([]); 
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token.replace('Bearer ', '')}` : ''
    });

    // Crear un solo parámetro de búsqueda según el tipo
    const params = new HttpParams().set(tipo, termino);
    console.log(`Buscando ${tipo} con término:`, termino);
    return this.http.get<any[]>(`${this.baseUrl}/search`, { 
      headers,
      params 
    }).pipe(
      catchError(error => {
        console.error('Error en la búsqueda:', error);
        return of([]);
      })
    );
  }
}