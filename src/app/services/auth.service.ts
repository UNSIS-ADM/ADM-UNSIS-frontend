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

    console.log('Intentando login en:', `${this.apiUrl}/login`);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
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
      roles: response.roles
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
}