import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IdResponse } from '../models/api.model';
import { CreateProposalPayload, Proposal } from '../models/proposal.model';

@Injectable({ providedIn: 'root' })
export class ProposalsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  submit(jobId: string, payload: CreateProposalPayload): Observable<string> {
    return this.http
      .post<IdResponse>(`${this.baseUrl}/jobs/${jobId}/proposals`, payload)
      .pipe(map((response) => response.proposal_id ?? response.id ?? ''));
  }

  getByJob(jobId: string): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${this.baseUrl}/jobs/${jobId}/proposals`);
  }

  accept(proposalId: string): Observable<string> {
    return this.http.patch<IdResponse>(`${this.baseUrl}/proposals/${proposalId}/accept`, {}).pipe(
      map((response) => response.message ?? 'Proposal accepted'),
    );
  }

  getMyBids(): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${this.baseUrl}/proposals/my-bids`);
  }

  withdraw(proposalId: string): Observable<string> {
    return this.http.delete<IdResponse>(`${this.baseUrl}/proposals/${proposalId}`).pipe(
      map((response) => response.message ?? 'Proposal withdrawn'),
    );
  }
}

