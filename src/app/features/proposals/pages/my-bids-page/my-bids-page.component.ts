import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Proposal } from '../../../../core/models/proposal.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProposalsService } from '../../../../core/services/proposals.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-my-bids-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    StatusBadgeComponent,
    ErrorBannerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './my-bids-page.component.html',
  styleUrl: './my-bids-page.component.scss',
})
export class MyBidsPageComponent {
  private readonly proposalsService = inject(ProposalsService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bids = signal<Proposal[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly actionId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');
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
  }

  withdraw(proposal: Proposal): void {
    if (!window.confirm('Withdraw this proposal?')) {
      return;
    }

    this.actionId.set(proposal.id);
    this.proposalsService
      .withdraw(proposal.id)
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

