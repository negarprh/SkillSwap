import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  selector: 'app-my-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    StarRatingComponent,
    SkillsListComponent,
    ErrorBannerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './my-profile-page.component.html',
  styleUrl: './my-profile-page.component.scss',
})
export class MyProfilePageComponent {
  private readonly usersService = inject(UsersService);
  private readonly reviewsService = inject(ReviewsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly profile = signal<User | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  constructor() {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.usersService
      .getMe()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.reviewsService
            .getForUser(profile.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (reviews) => {
                this.reviews.set(reviews);
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

