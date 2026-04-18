import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PromptService } from '../../services/prompt.service';

/**
 * AddPromptComponent – Reactive Form for creating a new AI prompt.
 * Validates: title (min 3), content (min 20), complexity (1–10).
 */
@Component({
  selector: 'app-add-prompt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Add New Prompt</h1>
        <p>Share an AI image prompt with the community</p>
      </div>

      <!-- Success message -->
      <div *ngIf="successMsg" class="alert alert-success">
        ✅ {{ successMsg }}
      </div>

      <!-- Server error -->
      <div *ngIf="serverError" class="alert alert-error">
        ⚠ {{ serverError }}
      </div>

      <!-- Form card -->
      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" id="add-prompt-form">

          <!-- Title field -->
          <div class="form-group">
            <label class="form-label" for="title">Title</label>
            <input
              id="title"
              type="text"
              class="form-control"
              formControlName="title"
              placeholder="e.g. Cyberpunk City at Night"
              [class.is-invalid]="isInvalid('title')"
            />
            <span class="error-msg" *ngIf="isInvalid('title')">
              ✕ Title must be at least 3 characters
            </span>
          </div>

          <!-- Content field -->
          <div class="form-group">
            <label class="form-label" for="content">Prompt Content</label>
            <textarea
              id="content"
              class="form-control"
              formControlName="content"
              rows="5"
              placeholder="Describe the AI image prompt in detail (minimum 20 characters)..."
              [class.is-invalid]="isInvalid('content')"
            ></textarea>
            <span class="error-msg" *ngIf="isInvalid('content')">
              ✕ Content must be at least 20 characters
            </span>
          </div>

          <!-- Complexity field -->
          <div class="form-group">
            <label class="form-label" for="complexity">
              Complexity: <strong>{{ form.get('complexity')?.value || 5 }}</strong> / 10
            </label>
            <input
              id="complexity"
              type="range"
              min="1"
              max="10"
              formControlName="complexity"
              class="complexity-slider"
            />
            <div class="slider-labels">
              <span>1 – Simple</span>
              <span>10 – Expert</span>
            </div>
          </div>

          <!-- Tags field -->
          <div class="form-group">
            <label class="form-label" for="tags">Tags <span style="color:#64748b;font-weight:400">(comma-separated, optional)</span></label>
            <input
              id="tags"
              type="text"
              class="form-control"
              formControlName="tags"
              placeholder="e.g. sci-fi, cyberpunk, fantasy"
            />
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="btn btn-primary btn-submit"
            [disabled]="submitting"
            id="submit-prompt-btn"
          >
            <span *ngIf="!submitting">✦ Create Prompt</span>
            <span *ngIf="submitting">Creating...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 36px;
      max-width: 640px;
      margin-bottom: 60px;
    }

    .btn-submit {
      width: 100%;
      padding: 14px;
      font-size: 1rem;
      margin-top: 8px;
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Range slider styling */
    .complexity-slider {
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      background: var(--bg-primary);
      border-radius: 3px;
      outline: none;
      margin-top: 4px;
    }
    .complexity-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--accent);
      cursor: pointer;
      border: 3px solid var(--bg-card);
      box-shadow: 0 0 12px var(--accent-glow);
      transition: transform var(--transition);
    }
    .complexity-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
    }
    .complexity-slider::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--accent);
      cursor: pointer;
      border: 3px solid var(--bg-card);
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
  `],
})
export class AddPromptComponent {
  form: FormGroup;
  submitting = false;
  successMsg = '';
  serverError = '';

  constructor(
    private fb: FormBuilder,
    private promptService: PromptService,
    private router: Router,
  ) {
    // Build reactive form with validation rules
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      complexity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      tags: [''],
    });
  }

  /** Helper: returns true when a field has been touched and is invalid */
  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /** Handle form submission */
  onSubmit(): void {
    // Mark all fields as touched to display any validation errors
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.serverError = '';
    this.successMsg = '';

    const rawTags: string = this.form.value.tags || '';
    const tags = rawTags.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);

    const payload = {
      title: this.form.value.title,
      content: this.form.value.content,
      complexity: Number(this.form.value.complexity),
      tags,
    };

    this.promptService.createPrompt(payload).subscribe({
      next: (created) => {
        this.submitting = false;
        this.successMsg = `Prompt "${created.title}" created successfully!`;
        this.form.reset({ complexity: 5 });

        // Navigate to the new prompt after a short delay
        setTimeout(() => {
          this.router.navigate(['/prompts', created.id]);
        }, 1200);
      },
      error: (err) => {
        this.submitting = false;
        if (err.error?.errors) {
          // Show first validation error from backend
          const firstKey = Object.keys(err.error.errors)[0];
          this.serverError = err.error.errors[firstKey];
        } else {
          this.serverError = 'Server error. Please try again.';
        }
      },
    });
  }
}
