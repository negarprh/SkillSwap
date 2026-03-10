import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { Review } from '../../../../core/models/review.model';
import { User } from '../../../../core/models/user.model';
import { ReviewsService } from '../../../../core/services/reviews.service';
import { UsersService } from '../../../../core/services/users.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { SkillsListComponent } from '../../../../shared/components/skills-list/skills-list.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-public-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StarRatingComponent,
    SkillsListComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
  ],
  templateUrl: './public-profile-page.component.html',
  styleUrl: './public-profile-page.component.scss',
})
export class PublicProfilePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly reviewsService = inject(ReviewsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadingReviews = signal(true);
  readonly profile = signal<User | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly errorMessage = signal('');
  readonly reviewsError = signal('');

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const username = params.get('username') ?? '';
          this.loading.set(true);
          this.errorMessage.set('');
          this.profile.set(null);
          this.reviews.set([]);
          this.reviewsError.set('');
          this.loadingReviews.set(true);
          return this.usersService.getPublicProfile(username);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.loading.set(false);
          this.loadReviews(profile.id);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  private loadReviews(userId: string): void {
    this.reviewsService
      .getForUser(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reviews) => {
          this.reviews.set(reviews);
          this.loadingReviews.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.loadingReviews.set(false);
          if (error.status === 401) {
            this.reviewsError.set('Reviews are available after sign in.');
            return;
          }
          this.reviewsError.set(extractErrorMessage(error));
        },
      });
  }
}

