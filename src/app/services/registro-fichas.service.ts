import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegistroFichasService {
  // URL del endpoint (por definir)
  private apiUrl = 'http://localhost:1200/api/fichas';

  constructor(private http: HttpClient) {}

  registrar(data: Record<string, number>): Observable<any> {
    // Si tuvieras el endpoint, harías:
    // return this.http.post(this.apiUrl, data);

    // Por ahora, simulamos respuesta exitosa
    return of({ success: true });
  }
}
