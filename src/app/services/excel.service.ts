import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExcelError {
  row: number;
  error: string;
}

export interface ExcelUploadResponse {
  success: boolean;
  message: string;
  errors: ExcelError[];
}

@Injectable({ providedIn: 'root' })
export class ExcelServiceApplicants {
  private apiUrl = environment.uploadaplicants;

  constructor(private http: HttpClient) {}

  uploadApplicants(file: File, token: string): Observable<ExcelUploadResponse> {
    const form = new FormData();
    form.append('file', file, file.name);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    // No ponemos Content-Type, el navegador lo pondrá automáticamente
    return this.http.post<ExcelUploadResponse>(this.apiUrl, form, { headers });
  }
}

@Injectable({ providedIn: 'root' })
export class ExcelServiceResultados {
  private apiUrl = environment.uploadresults;

  constructor(private http: HttpClient) {}

  uploadApplicants(file: File, token: string): Observable<ExcelUploadResponse> {
    const form = new FormData();
    form.append('file', file, file.name);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    // No ponemos Content-Type, el navegador lo pondrá automáticamente
    return this.http.post<ExcelUploadResponse>(this.apiUrl, form, { headers });
  }
}
