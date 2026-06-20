import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.models';
import { environment } from '../../../../environments/environment';
import { BACKEND_ROUTES } from '../../../core/constants/backend-route.const';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${BACKEND_ROUTES.AUTH}`;


  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register`, request);
  }
}
