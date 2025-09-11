import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface LoginResponse {
  token: string;
  refreshToken: string;
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
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) { }

  /** LOGIN */
  login(credentials: { username: string; password: string }): Observable<any> {
    const url = environment.apiUrl + environment.loginEndpoint;
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap(response => {
        console.log('Respuesta del servidor:', response);
        if (response && response.token) {
          // guarda accessToken y refreshToken
          this.saveToken(`Bearer ${response.token}`);
          this.saveRefreshToken(response.refreshToken);
          this.saveUserInfo(response);
        }
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

  saveToken(token: string): void {
     localStorage.setItem('token', token);
    this.tokenSubject.next(token); // 🔹 avisamos que hay token nuevo
  }

  getToken(): string | null {
   return localStorage.getItem('token');
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_info');
  }

  getTokenExpiration(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const pureToken = token.startsWith('Bearer ')
        ? token.split(' ')[1]
        : token;
      const decoded = jwtDecode<{ exp: number }>(pureToken);
      return decoded.exp; // en segundos
    } catch (e) {
      console.error('Error decodificando token:', e);
      return null;
    }
  }

  getTimeLeft(): number | null {
    const exp = this.getTokenExpiration();
    if (!exp) return null;
    const now = Math.floor(Date.now() / 1000);
    return (exp - now) * 1000;
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No hay refreshToken almacenado');
    }
    const oldAccessToken = this.getToken(); // para mostrar en consola
    const url = `${this.apiUrl}/auth/refresh`;
    return this.http.post(url, { refreshToken }).pipe(
      tap((res: any) => {
        if (res.accessToken) {
          console.log('AccessToken anterior:', oldAccessToken);
          console.log('AccessToken nuevo:', res.accessToken);
          // actualiza tokens
          this.saveToken(`Bearer ${res.accessToken}`);
          if (res.refreshToken) {
            this.saveRefreshToken(res.refreshToken);
          }
        }
      })
    );
  }
  validarApplicant() {
    // Llamada ligera que hará 403 si el backend está bloqueando applicants
    return this.http.get(environment.apiUrl + '/api/applicant/me'); // o cualquier endpoint que use ROLE_APPLICANT

  }
  getUserInfo(): any {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }
}
