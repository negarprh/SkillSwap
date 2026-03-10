import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JobDetail } from '../../../../core/models/job.model';
import { Proposal } from '../../../../core/models/proposal.model';
import { AuthService } from '../../../../core/services/auth.service';
import { JobsService } from '../../../../core/services/jobs.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProposalsService } from '../../../../core/services/proposals.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-job-proposals-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    StatusBadgeComponent,
    ErrorBannerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './job-proposals-page.component.html',
  styleUrl: './job-proposals-page.component.scss',
})
export class JobProposalsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly jobsService = inject(JobsService);
  private readonly proposalsService = inject(ProposalsService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly job = signal<JobDetail | null>(null);
  readonly proposals = signal<Proposal[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly actionId = signal<string | null>(null);
  readonly freelancerNames = signal<Record<string, string>>({});

  constructor() {
    this.load();
  }

  private load(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (!jobId) {
      this.errorMessage.set('Missing job id.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.jobsService
      .getById(jobId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (job) => {
          this.job.set(job);
          if (job.owner_id !== this.auth.currentUser()?.id) {
            this.errorMessage.set('Only the job owner can view proposals for this listing.');
            this.loading.set(false);
            return;
          }
          this.proposalsService
            .getByJob(jobId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (proposals) => {
                this.proposals.set(proposals);
                this.loading.set(false);
                this.resolveFreelancerNames(proposals);
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

  private resolveFreelancerNames(proposals: Proposal[]): void {
    const ids = [...new Set(proposals.map((proposal) => proposal.freelancer_id).filter(Boolean))];
    if (!ids.length) {
      return;
    }

    // The backend currently exposes public profiles by username, so names are best-effort from IDs.
    const map = Object.fromEntries(ids.map((id) => [id, id]));
    this.freelancerNames.set(map);
  }

  acceptProposal(proposal: Proposal): void {
    const job = this.job();
    if (!job || job.status !== 'open') {
      this.errorMessage.set('Only open jobs can accept proposals.');
      return;
    }

    this.actionId.set(proposal.id);
    this.proposalsService
      .accept(proposal.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (message) => {
          this.notifications.success(message);
          this.actionId.set(null);
          this.load();
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
          this.actionId.set(null);
        },
      });
  }
}
