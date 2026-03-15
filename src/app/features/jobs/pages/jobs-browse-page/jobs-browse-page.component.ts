import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DEFAULT_JOB_CATEGORIES, JOB_STATUSES } from '../../../../core/config/api.config';
import { Job } from '../../../../core/models/job.model';
import { JobsService } from '../../../../core/services/jobs.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-jobs-browse-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    StatusBadgeComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
  ],
  templateUrl: './jobs-browse-page.component.html',
  styleUrl: './jobs-browse-page.component.scss',
})
export class JobsBrowsePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly jobsService = inject(JobsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = DEFAULT_JOB_CATEGORIES;
  readonly statuses = JOB_STATUSES;
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly minBudgetValidationError = signal('');
  readonly jobs = signal<Job[]>([]);

  readonly filtersForm = this.fb.group({
    category: [''],
    status: ['open'],
    min_budget: [''],
  });

  constructor() {
    this.search();
  }

  search(): void {
    const raw = this.filtersForm.getRawValue();
    const minBudgetValue = raw.min_budget?.trim();
    const minBudget = minBudgetValue ? Number(minBudgetValue) : null;
    if (minBudgetValue && (!Number.isFinite(minBudget) || Number(minBudget) < 0)) {
      this.minBudgetValidationError.set('Min budget must be a valid number greater than or equal to 0.');
      return;
    }

    this.minBudgetValidationError.set('');
    const payload = {
      category: raw.category?.trim() || undefined,
      status: (raw.status || 'open') as 'open' | 'in_progress' | 'completed',
      min_budget: Number.isFinite(minBudget) ? minBudget : undefined,
    };

    this.loading.set(true);
    this.errorMessage.set('');

    this.jobsService
      .search(payload)
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

  resetFilters(): void {
    this.filtersForm.reset({
      category: '',
      status: 'open',
      min_budget: '',
    });
    this.minBudgetValidationError.set('');
    this.search();
  }
}
