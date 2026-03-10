import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlatformStats } from '../models/platform.model';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.baseUrl}/platform/stats`);
  }
}

