import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { jobStatusLabel } from '../../../core/utils/status.util';
import { JobStatus } from '../../../core/config/api.config';

type ProposalStatus = 'pending' | 'accepted' | 'rejected';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: JobStatus | ProposalStatus;

  label(): string {
    if (this.status === 'pending') {
      return 'Pending';
    }

    if (this.status === 'accepted') {
      return 'Accepted';
    }

    if (this.status === 'rejected') {
      return 'Rejected';
    }

    return jobStatusLabel(this.status);
  }
}

