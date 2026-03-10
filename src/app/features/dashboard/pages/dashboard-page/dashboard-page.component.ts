import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Job } from '../../../../core/models/job.model';
import { Proposal } from '../../../../core/models/proposal.model';
import { AuthService } from '../../../../core/services/auth.service';
import { JobsService } from '../../../../core/services/jobs.service';
import { ProposalsService } from '../../../../core/services/proposals.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    ErrorBannerComponent,
    EmptyStateComponent,
    StarRatingComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  private readonly auth = inject(AuthService);
  private readonly jobsService = inject(JobsService);
  private readonly proposalsService = inject(ProposalsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly postings = signal<Job[]>([]);
  readonly bids = signal<Proposal[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly user = this.auth.currentUser;

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.jobsService
      .getMyPostings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (jobs) => {
          this.postings.set(jobs);
          this.proposalsService
            .getMyBids()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (bids) => {
                this.bids.set(bids);
                this.loading.set(false);
              },
              error: (error) => {
                this.errorMessage.set(extractErrorMessage(error));
                this.loading.set(false);
              },
            });
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
          this.loading.set(false);
        },
      });
  }
}

