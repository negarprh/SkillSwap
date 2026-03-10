import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { DEFAULT_JOB_CATEGORIES } from '../../../../core/config/api.config';
import { JobsService } from '../../../../core/services/jobs.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-create-job-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorBannerComponent],
  templateUrl: './create-job-page.component.html',
  styleUrl: './create-job-page.component.scss',
})
export class CreateJobPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly jobsService = inject(JobsService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly categories = DEFAULT_JOB_CATEGORIES;
  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(2500)]],
    budget: [0, [Validators.required, Validators.min(1)]],
    category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      title: this.form.controls.title.value.trim(),
      description: this.form.controls.description.value.trim(),
      category: this.form.controls.category.value.trim(),
    };

    this.submitting.set(true);
    this.errorMessage.set('');

    this.jobsService
      .create(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: async (jobId) => {
          this.notifications.success('Job posted successfully.');
          await this.router.navigate(['/jobs', jobId || '']);
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }
}

