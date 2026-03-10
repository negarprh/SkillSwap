import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Job } from '../../../../core/models/job.model';
import { JobsService } from '../../../../core/services/jobs.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-my-postings-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    StatusBadgeComponent,
    ErrorBannerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './my-postings-page.component.html',
  styleUrl: './my-postings-page.component.scss',
})
export class MyPostingsPageComponent {
  private readonly jobsService = inject(JobsService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly jobs = signal<Job[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly actionInProgress = signal<string | null>(null);

  constructor() {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.jobsService
      .getMyPostings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (jobs) => {
          this.jobs.set(jobs);
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  markCompleted(jobId: string): void {
    this.actionInProgress.set(jobId);
    this.jobsService
      .complete(jobId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (message) => {
          this.notifications.success(message);
          this.actionInProgress.set(null);
          this.loadJobs();
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
          this.actionInProgress.set(null);
        },
      });
  }
}

