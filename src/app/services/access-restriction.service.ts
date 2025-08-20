import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AccessRestriction } from '../models/access-restriction.model';

@Injectable({
  providedIn: 'root',
})
export class AccessRestrictionService {
  private apiUrl = `${environment.apiUrl}${environment.accessRestrictionEndpoint}`;

  constructor(private http: HttpClient) {}

  getRestriction(): Observable<AccessRestriction> {
    return this.http.get<AccessRestriction>(this.apiUrl);
  }

  saveOrUpdate(rule: AccessRestriction): Observable<AccessRestriction> {
    return this.http.post<AccessRestriction>(this.apiUrl, rule);
  }

  toggleEnabled(id: number, enabled: boolean): Observable<AccessRestriction> {
    return this.http.patch<AccessRestriction>(
      `${this.apiUrl}/enabled/${id}?enabled=${enabled}`,
      {}
    );
  }
}
