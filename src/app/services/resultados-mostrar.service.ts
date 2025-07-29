import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResultadosMostrarService {
  private endpoint = environment.apiUrl + environment.getresultmostrarEndpoint;

  constructor(private http: HttpClient) {}

  getResultadosUsuario(): Observable<any> {
    return this.http.get<any>(this.endpoint).pipe(
      tap(data => console.log('Respuesta del endpoint /api/applicants/me:', data))
    );
  }
}