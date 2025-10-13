import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private base = 'http://localhost:1200/api/templates';

  constructor(private http: HttpClient) {}

  // El "as 'json'" es un hack tipado que mantiene responseType 'blob' en runtime
  downloadTemplate(
    key: 'aspirantes' | 'resultados'
  ): Observable<HttpResponse<Blob>> {
    const url = `${this.base}/${encodeURIComponent(key)}/download`;
    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob' as const,
    });
  }

  listTemplates(): Observable<any> {
    return this.http.get(this.base);
  }
}
