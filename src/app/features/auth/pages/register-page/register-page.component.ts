import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiErrorResponse } from '../../../../core/models/api.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { extractErrorMessage } from '../../../../core/utils/error-message.util';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { SkillsChipsInputComponent } from '../../../../shared/components/skills-chips-input/skills-chips-input.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ErrorBannerComponent,
    SkillsChipsInputComponent,
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly suggestedUsername = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(70)]],
    username: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(32), Validators.pattern(/^[a-zA-Z0-9_.-]+$/)],
    ],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    skills: this.fb.nonNullable.control<string[]>([], [Validators.required, Validators.minLength(1)]),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      name: this.form.controls.name.value.trim(),
      username: this.form.controls.username.value.trim(),
      email: this.form.controls.email.value.trim(),
      bio: this.form.controls.bio.value.trim(),
      skills: this.form.controls.skills.value
        .map((skill) => skill.trim())
        .filter((skill) => !!skill),
    };

    this.errorMessage.set('');
    this.suggestedUsername.set(null);
    this.submitting.set(true);

    this.auth
      .register(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: async () => {
          this.notifications.success('Registration successful. You can now sign in.');
          await this.router.navigate(['/login'], {
            queryParams: { email: payload.email },
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(extractErrorMessage(error));
          const payload = error.error as ApiErrorResponse | null;
          if (payload && typeof payload.suggested_username === 'string') {
            this.suggestedUsername.set(payload.suggested_username);
          }
        },
      });
  }

  applySuggestion(): void {
    const suggestion = this.suggestedUsername();
    if (!suggestion) {
      return;
    }
    this.form.controls.username.setValue(suggestion);
    this.form.controls.username.markAsDirty();
  }
}

