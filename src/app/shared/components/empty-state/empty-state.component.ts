import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() description = 'Try changing filters or come back later.';
  @Input() actionLabel?: string;
  @Input() actionLink?: string | any[];
}

