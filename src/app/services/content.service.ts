import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContentDTO, ContentPartDTO } from '../models/content.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private base = `${environment.apiUrl}/api/content`;

  constructor(private http: HttpClient) {}

  getByKey(key: string): Observable<ContentDTO> {
    return this.http.get<ContentDTO>(`${this.base}/${encodeURIComponent(key)}`);
  }

  listAll(): Observable<ContentDTO[]> {
    return this.http.get<ContentDTO[]>(this.base);
  }

  upsertParts(key: string, parts: ContentPartDTO[]) {
    return this.http.put<ContentDTO>(
      `${this.base}/${encodeURIComponent(key)}/parts`,
      parts
    );
  }

  upsertPart(key: string, partKey: string, part: ContentPartDTO) {
    return this.http.put<ContentPartDTO>(
      `${this.base}/${encodeURIComponent(key)}/parts/${encodeURIComponent(
        partKey
      )}`,
      part
    );
  }
}
