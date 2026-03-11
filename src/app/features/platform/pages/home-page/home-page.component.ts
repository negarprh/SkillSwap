import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Job } from '../../../../core/models/job.model';
import { PlatformStats } from '../../../../core/models/platform.model';
import { AuthService } from '../../../../core/services/auth.service';
import { JobsService } from '../../../../core/services/jobs.service';
import { PlatformService } from '../../../../core/services/platform.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    EmptyStateComponent,
    ErrorBannerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private readonly platformService = inject(PlatformService);
  private readonly jobsService = inject(JobsService);
  readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly stats = signal<PlatformStats | null>(null);
  readonly jobs = signal<Job[]>([]);
  readonly statsError = signal('');
  readonly jobsError = signal('');
  readonly loadingStats = signal(true);
  readonly loadingJobs = signal(true);

  constructor() {
    this.loadStats();
    this.loadOpenJobs();
  }

  private loadStats(): void {
    this.loadingStats.set(true);
    this.platformService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.loadingStats.set(false);
        },
        error: (error) => {
          this.statsError.set(extractErrorMessage(error));
          this.loadingStats.set(false);
        },
      });
  }

  private loadOpenJobs(): void {
    this.loadingJobs.set(true);
    this.jobsService
      .search({ status: 'open' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (jobs) => {
          this.jobs.set(jobs.slice(0, 6));
          this.loadingJobs.set(false);
        },
        error: (error) => {
          this.jobsError.set(extractErrorMessage(error));
          this.loadingJobs.set(false);
        },
      });
  }
}
