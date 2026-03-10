import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { DEFAULT_JOB_CATEGORIES, JOB_STATUSES } from '../../../../core/config/api.config';
import { JobDetail } from '../../../../core/models/job.model';
import { AuthService } from '../../../../core/services/auth.service';
import { JobsService } from '../../../../core/services/jobs.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-edit-job-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorBannerComponent],
  templateUrl: './edit-job-page.component.html',
  styleUrl: './edit-job-page.component.scss',
})
export class EditJobPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly jobsService = inject(JobsService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = DEFAULT_JOB_CATEGORIES;
  readonly statuses = JOB_STATUSES;
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly job = signal<JobDetail | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(4)]],
    description: ['', [Validators.required, Validators.minLength(12)]],
    budget: [1, [Validators.required, Validators.min(1)]],
    category: ['', [Validators.required]],
    status: ['open' as 'open' | 'in_progress' | 'completed', [Validators.required]],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Missing job id.');
      this.loading.set(false);
      return;
    }
    this.loadJob(id);
  }

  private loadJob(jobId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.jobsService
      .getById(jobId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (job) => {
          this.job.set(job);
          if (job.owner_id !== this.auth.currentUser()?.id) {
            this.errorMessage.set('You can edit only your own jobs.');
            this.loading.set(false);
            return;
          }
          this.form.patchValue({
            title: job.title,
            description: job.description,
            budget: job.budget,
            category: job.category,
            status: job.status,
          });
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  submit(): void {
    const currentJob = this.job();
    if (!currentJob) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.jobsService
      .update(currentJob.id, {
        ...this.form.getRawValue(),
        title: this.form.controls.title.value.trim(),
        description: this.form.controls.description.value.trim(),
        category: this.form.controls.category.value.trim(),
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: async (message) => {
          this.notifications.success(message);
          await this.router.navigate(['/jobs', currentJob.id]);
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }
}

