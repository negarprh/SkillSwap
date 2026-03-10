import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from '../models/auth.model';
import { User } from '../models/user.model';
import { NotificationService } from './notification.service';
import { StorageService } from './storage.service';
import { UsersService } from './users.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly usersService = inject(UsersService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly baseUrl = environment.apiBaseUrl;

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.token());

  token(): string | null {
    return this.storage.getToken();
  }

  register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap((response) => {
        this.storage.setToken(response.token);
        this.currentUser.set(response.user);
      }),
    );
  }

  async restoreSession(): Promise<void> {
    const token = this.storage.getToken();
    if (!token) {
      this.currentUser.set(null);
      return;
    }

    try {
      const user = await firstValueFrom(
        this.usersService.getMe().pipe(
          catchError(() => {
            this.storage.clearToken();
            this.currentUser.set(null);
            return of(null);
          }),
        ),
      );
      if (user) {
        this.currentUser.set(user);
      }
    } catch {
      this.storage.clearToken();
      this.currentUser.set(null);
    }
  }

  logout(navigateToLogin = true, message?: string): void {
    this.storage.clearToken();
    this.currentUser.set(null);
    if (message) {
      this.notifications.info(message);
    }
    if (navigateToLogin) {
      void this.router.navigate(['/login']);
    }
  }

  handleUnauthorized(error: HttpErrorResponse): void {
    if (error.status === 401 && this.storage.getToken()) {
      this.logout(true, 'Your session expired. Please log in again.');
    }
  }
}

