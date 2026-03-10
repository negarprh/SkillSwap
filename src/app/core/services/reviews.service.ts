import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IdResponse } from '../models/api.model';
import { CreateReviewPayload, Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  submit(jobId: string, payload: CreateReviewPayload): Observable<string> {
    return this.http.post<IdResponse>(`${this.baseUrl}/jobs/${jobId}/reviews`, payload).pipe(
      map((response) => response.review_id ?? response.id ?? response.message ?? 'Review submitted'),
    );
  }

  getForUser(userId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/user/${userId}`);
  }
}

