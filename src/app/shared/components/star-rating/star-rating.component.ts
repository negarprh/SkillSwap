import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss',
})
export class StarRatingComponent {
  @Input() value = 0;
  @Input() size: 'sm' | 'md' = 'md';

  stars(): number[] {
    return [1, 2, 3, 4, 5];
  }
}

