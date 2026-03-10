import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skills-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills-list.component.html',
  styleUrl: './skills-list.component.scss',
})
export class SkillsListComponent {
  @Input() skills: string[] = [];
}

