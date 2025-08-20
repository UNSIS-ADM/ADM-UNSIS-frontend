import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  roles: string[];
  fullName: string;  // ← Cambiado de full_name a fullName
  curp?: string;    // ← Campo adicional que aparece en la respuesta
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(credentials: {username: string, password: string}): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    const url = environment.apiUrl + environment.loginEndpoint;
    console.log('Intentando login en:', url);
    
    return this.http.post<LoginResponse>(url, {
      username: credentials.username,
      password: credentials.password
    }, { headers }).pipe(
      tap(response => {
        console.log('Respuesta del servidor:', response);
        if (response && response.token) {
          // Guarda el token con el prefijo Bearer si es necesario
          this.saveToken(`Bearer ${response.token}`);
          // Guarda información adicional del usuario si es necesario
          this.saveUserInfo(response);
          tap(response => {
  console.log('Respuesta del servidor:', response); // ← Verifica que full_name esté aquí
})
        }
      }),
      catchError(error => {
        console.error('Error en autenticación:', error);
        throw error;
      })
    );
  }

  private saveUserInfo(response: LoginResponse): void {
    localStorage.setItem('user_info', JSON.stringify({
      id: response.id,
      username: response.username,
      roles: response.roles,
      full_name: response.fullName
    }));
  }

  // Método para guardar el token en localStorage
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Método para obtener el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getUserInfo(): any {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;

  }
  // auth.service.ts
validarApplicant() {
  // Llamada ligera que hará 403 si el backend está bloqueando applicants
  return this.http.get(environment.apiUrl + '/api/applicant/me'); // o cualquier endpoint que use ROLE_APPLICANT
}


}