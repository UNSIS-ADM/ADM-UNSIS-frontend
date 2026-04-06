import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdminUser } from '../models/admin-user.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  //  private baseUrl = 'http://localhost:1200/api/admin/users';
  private baseUrl = environment.apiUrl + environment.getUsuariosEndpoint;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.baseUrl);
  }

  save(user: AdminUser): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.baseUrl, user);
  }

  changeStatus(id: number, active: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/active`, null, {
      params: { active },
    });
  }
}
