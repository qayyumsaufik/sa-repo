import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  private buildUrl(endpoint: string): string {
    const base = this.apiUrl.replace(/\/+$/, '');
    const path = endpoint.replace(/^\/+/, '');
    return `${base}/${path}`;
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | Date | null | undefined>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          const serialized = value instanceof Date ? value.toISOString() : value.toString();
          httpParams = httpParams.set(key, serialized);
        }
      });
    }
    const url = this.buildUrl(endpoint);
    return this.http.get<T>(url, { params: httpParams });
  }

  post<TResponse, TBody = unknown>(endpoint: string, body: TBody): Observable<TResponse> {
    const url = this.buildUrl(endpoint);
    return this.http.post<TResponse>(url, body);
  }

  put<TResponse, TBody = unknown>(endpoint: string, body: TBody): Observable<TResponse> {
    const url = this.buildUrl(endpoint);
    return this.http.put<TResponse>(url, body);
  }

  delete<TResponse>(endpoint: string): Observable<TResponse> {
    const url = this.buildUrl(endpoint);
    return this.http.delete<TResponse>(url);
  }
}
