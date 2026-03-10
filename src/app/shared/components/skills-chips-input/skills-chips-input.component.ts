import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-skills-chips-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skills-chips-input.component.html',
  styleUrl: './skills-chips-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SkillsChipsInputComponent),
      multi: true,
    },
  ],
})
export class SkillsChipsInputComponent implements ControlValueAccessor {
  skills: string[] = [];
  draft = '';
  disabled = false;

  private onChange: (skills: string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string[] | null): void {
    this.skills = value ?? [];
  }

  registerOnChange(fn: (skills: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  addDraftAsSkill(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const normalized = this.draft.trim();
    if (!normalized) {
      return;
    }

    const alreadyExists = this.skills.some(
      (skill) => skill.toLowerCase() === normalized.toLowerCase(),
    );
    if (alreadyExists) {
      this.draft = '';
      return;
    }

    this.skills = [...this.skills, normalized];
    this.draft = '';
    this.onChange(this.skills);
    this.onTouched();
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter((item) => item !== skill);
    this.onChange(this.skills);
    this.onTouched();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      this.addDraftAsSkill(event);
    }
  }

  markTouched(): void {
    this.onTouched();
  }
}
