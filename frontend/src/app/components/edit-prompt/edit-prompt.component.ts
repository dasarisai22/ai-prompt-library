import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PromptService } from '../../services/prompt.service';

@Component({
  selector: 'app-edit-prompt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Edit Prompt</h1>
        <p>Update your AI image prompt details</p>
      </div>

      <div *ngIf="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
      <div *ngIf="serverError" class="alert alert-error">⚠ {{ serverError }}</div>

      <div class="form-card" *ngIf="!loading">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Title field -->
          <div class="form-group">
            <label class="form-label" for="title">Title</label>
            <input id="title" type="text" class="form-control" formControlName="title" placeholder="Prompt Title" [class.is-invalid]="isInvalid('title')"/>
            <span class="error-msg" *ngIf="isInvalid('title')">✕ Title must be at least 3 characters</span>
          </div>

          <!-- Content field -->
          <div class="form-group">
            <label class="form-label" for="content">Prompt Content</label>
            <textarea id="content" class="form-control" formControlName="content" rows="5" placeholder="Prompt details..." [class.is-invalid]="isInvalid('content')"></textarea>
            <span class="error-msg" *ngIf="isInvalid('content')">✕ Content must be at least 20 characters</span>
          </div>

          <!-- Complexity field -->
          <div class="form-group">
            <label class="form-label" for="complexity">Complexity: <strong>{{ form.get('complexity')?.value || 5 }}</strong> / 10</label>
            <input id="complexity" type="range" min="1" max="10" formControlName="complexity" class="complexity-slider"/>
          </div>

          <button type="submit" class="btn btn-primary btn-submit" [disabled]="submitting">
            <span *ngIf="!submitting">Update Prompt</span>
            <span *ngIf="submitting">Updating...</span>
          </button>
          
          <button type="button" class="btn btn-ghost btn-submit" style="margin-top: 10px;" (click)="cancel()">
            Cancel
          </button>
        </form>
      </div>
      
      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner"></div>
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
    }
  `],
})
export class EditPromptComponent implements OnInit {
  form: FormGroup;
  submitting = false;
  loading = true;
  successMsg = '';
  serverError = '';
  promptId!: number;

  constructor(
    private fb: FormBuilder,
    private promptService: PromptService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      complexity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    });
  }

  ngOnInit() {
    this.promptId = Number(this.route.snapshot.paramMap.get('id'));
    this.promptService.getPrompt(this.promptId).subscribe({
      next: (prompt) => {
        this.form.patchValue({
          title: prompt.title,
          content: prompt.content,
          complexity: prompt.complexity
        });
        this.loading = false;
      },
      error: () => {
        this.serverError = 'Failed to load prompt for editing.';
        this.loading = false;
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  cancel() {
    this.router.navigate(['/prompts']);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting = true;
    this.serverError = '';
    this.successMsg = '';

    const payload = {
      title: this.form.value.title,
      content: this.form.value.content,
      complexity: Number(this.form.value.complexity),
    };

    this.promptService.updatePrompt(this.promptId, payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMsg = 'Prompt updated successfully!';
        setTimeout(() => this.router.navigate(['/prompts']), 1000);
      },
      error: (err) => {
        this.submitting = false;
        this.serverError = err.error?.errors ? Object.values(err.error.errors)[0] as string : 'Update failed.';
      },
    });
  }
}
