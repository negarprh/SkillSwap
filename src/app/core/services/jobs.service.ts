import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IdResponse } from '../models/api.model';
import {
  CreateJobPayload,
  Job,
  JobDetail,
  JobSearchFilters,
  UpdateJobPayload,
} from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  search(filters: JobSearchFilters): Observable<Job[]> {
    return this.http.post<Job[]>(`${this.baseUrl}/jobs/search`, filters);
  }

  create(payload: CreateJobPayload): Observable<string> {
    return this.http.post<IdResponse>(`${this.baseUrl}/jobs`, payload).pipe(
      map((response) => response.job_id ?? response.id ?? ''),
    );
  }

  getById(jobId: string): Observable<JobDetail> {
    return this.http.get<JobDetail>(`${this.baseUrl}/jobs/${jobId}`);
  }

  update(jobId: string, payload: UpdateJobPayload): Observable<string> {
    return this.http.patch<IdResponse>(`${this.baseUrl}/jobs/${jobId}`, payload).pipe(
      map((response) => response.message ?? 'Job updated'),
    );
  }

  getMyPostings(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.baseUrl}/jobs/my-postings`);
  }

  complete(jobId: string): Observable<string> {
    return this.http.patch<IdResponse>(`${this.baseUrl}/jobs/${jobId}/complete`, {}).pipe(
      map((response) => response.message ?? 'Job completed'),
    );
  }
}

