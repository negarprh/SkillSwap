import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { JobDetail } from '../../../../core/models/job.model';
import { Proposal } from '../../../../core/models/proposal.model';
import { Review } from '../../../../core/models/review.model';
import { AuthService } from '../../../../core/services/auth.service';
import { JobsService } from '../../../../core/services/jobs.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProposalsService } from '../../../../core/services/proposals.service';
import { ReviewsService } from '../../../../core/services/reviews.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-job-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CurrencyPipe,
    StatusBadgeComponent,
    ErrorBannerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './job-details-page.component.html',
  styleUrl: './job-details-page.component.scss',
})
export class JobDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly jobsService = inject(JobsService);
  private readonly proposalsService = inject(ProposalsService);
  private readonly reviewsService = inject(ReviewsService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly errorMessage = signal('');
  readonly job = signal<JobDetail | null>(null);
  readonly userBids = signal<Proposal[]>([]);
  readonly participantReviews = signal<Review[]>([]);
  readonly reviewError = signal('');

  readonly proposalForm = this.fb.nonNullable.group({
    price: [1, [Validators.required, Validators.min(1)]],
    cover_letter: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1500)]],
  });

  readonly reviewForm = this.fb.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.maxLength(1000)]],
  });

  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? '');
  readonly isOwner = computed(() => this.job()?.owner_id === this.currentUserId());
  readonly isFreelancer = computed(() => this.job()?.freelancer_id === this.currentUserId());
  readonly isParticipant = computed(() => this.isOwner() || this.isFreelancer());
  readonly canComplete = computed(
    () => this.isParticipant() && this.job()?.status === 'in_progress' && !this.actionLoading(),
  );
  readonly canSubmitProposal = computed(() => {
    const currentJob = this.job();
    if (!currentJob || currentJob.status !== 'open' || this.isOwner()) {
      return false;
    }
    return !this.userBids().some((bid) => bid.job_id === currentJob.id && bid.status === 'pending');
  });
  readonly reviewTargetId = computed(() => {
    const currentJob = this.job();
    if (!currentJob) {
      return '';
    }
    return this.isOwner() ? currentJob.freelancer_id ?? '' : currentJob.owner_id;
  });
  readonly alreadyReviewed = computed(() => {
    const currentJob = this.job();
    const me = this.currentUserId();
    if (!currentJob || !me) {
      return false;
    }
    return this.participantReviews().some((review) => review.job_id === currentJob.id && review.reviewer_id === me);
  });
  readonly canReview = computed(
    () =>
      this.isParticipant() &&
      this.job()?.status === 'completed' &&
      !!this.reviewTargetId() &&
      this.reviewTargetId() !== this.currentUserId() &&
      !this.alreadyReviewed(),
  );

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
    this.reviewError.set('');

    this.jobsService
      .getById(jobId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (job) => {
          this.job.set(job);
          this.loadBidsAndReviews(job);
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  private loadBidsAndReviews(job: JobDetail): void {
    const reviewTargetId =
      this.currentUserId() && this.currentUserId() === job.owner_id ? job.freelancer_id : job.owner_id;

    forkJoin({
      bids: this.proposalsService.getMyBids().pipe(catchError(() => of([]))),
      reviews:
        reviewTargetId && job.status === 'completed'
          ? this.reviewsService.getForUser(reviewTargetId).pipe(catchError(() => of([])))
          : of([]),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ bids, reviews }) => {
          this.userBids.set(bids);
          this.participantReviews.set(reviews);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  submitProposal(): void {
    const job = this.job();
    if (!job) {
      return;
    }
    if (this.proposalForm.invalid) {
      this.proposalForm.markAllAsTouched();
      return;
    }

    this.actionLoading.set(true);
    this.errorMessage.set('');
    const payload = this.proposalForm.getRawValue();

    this.proposalsService
      .submit(job.id, {
        price: payload.price,
        cover_letter: payload.cover_letter.trim(),
        message: payload.cover_letter.trim(),
      })
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Proposal submitted.');
          this.proposalForm.reset({
            price: 1,
            cover_letter: '',
          });
          this.load();
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  completeJob(): void {
    const job = this.job();
    if (!job) {
      return;
    }

    this.actionLoading.set(true);
    this.jobsService
      .complete(job.id)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: (message) => {
          this.notifications.success(message);
          this.load();
        },
        error: (error) => {
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  submitReview(): void {
    const job = this.job();
    const targetId = this.reviewTargetId();
    if (!job || !targetId) {
      return;
    }
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.actionLoading.set(true);
    this.reviewError.set('');

    const payload = this.reviewForm.getRawValue();
    this.reviewsService
      .submit(job.id, {
        target_id: targetId,
        rating: Number(payload.rating),
        comment: payload.comment.trim() || undefined,
      })
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Review submitted.');
          this.reviewForm.reset({ rating: 5, comment: '' });
          this.load();
        },
        error: (error) => {
          this.reviewError.set(extractErrorMessage(error));
        },
      });
  }
}
