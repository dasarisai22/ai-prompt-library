import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PromptService } from '../../services/prompt.service';
import { AuthService, AuthStatus } from '../../services/auth.service';
import { Prompt } from '../../models/prompt.model';

@Component({
  selector: 'app-prompt-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <!-- Loading -->
      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner"></div>
        <span>Loading prompt...</span>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="alert alert-error">⚠ {{ error }}</div>

      <!-- Detail Card -->
      <div *ngIf="!loading && prompt" class="detail-wrapper">
        <a routerLink="/prompts" class="back-link">← Back to all prompts</a>

        <div class="detail-card">
          <!-- Header: Title + Action Buttons -->
          <div class="detail-header">
            <div class="title-row">
              <h1 id="prompt-title">{{ prompt.title }}</h1>

              <!-- Edit + Delete shown only to the author (or any logged-in user for legacy prompts) -->
              <div class="action-row" *ngIf="authenticated && canEdit">
                <button class="btn-action btn-edit" (click)="onEdit()">✏ Edit</button>
                <button *ngIf="!confirmDelete" class="btn-action btn-delete" (click)="confirmDelete = true">
                  🗑 Delete
                </button>
                <!-- Inline confirm row -->
                <ng-container *ngIf="confirmDelete">
                  <span style="font-size:0.85rem; color:#f87171;">Are you sure?</span>
                  <button class="btn-action btn-delete" (click)="onDelete()">Yes, Delete</button>
                  <button class="btn-action btn-edit" (click)="confirmDelete = false">Cancel</button>
                </ng-container>
              </div>
            </div>

            <div class="detail-badges">
              <span class="badge badge-complexity">⚡ Complexity: {{ prompt.complexity }}/10</span>
              <span class="badge badge-views" id="view-count-badge">
                👁 {{ prompt.view_count }} {{ prompt.view_count === 1 ? 'view' : 'views' }}
              </span>
              <span class="badge badge-author" *ngIf="prompt.author">by @{{ prompt.author }}</span>
            </div>

            <!-- Tags -->
            <div class="tag-row" *ngIf="prompt.tags && prompt.tags.length > 0">
              <span *ngFor="let tag of prompt.tags" class="tag-pill">#{{ tag }}</span>
            </div>
          </div>

          <!-- Complexity bar -->
          <div class="complexity-bar-wrapper">
            <div class="complexity-label">Difficulty Level</div>
            <div class="complexity-bar">
              <div class="complexity-fill"
                   [style.width.%]="prompt.complexity * 10"
                   [class.low]="prompt.complexity <= 3"
                   [class.mid]="prompt.complexity > 3 && prompt.complexity <= 7"
                   [class.high]="prompt.complexity > 7">
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="detail-content">
            <h3 class="section-label">Prompt Content</h3>
            <div class="content-box" id="prompt-content">{{ prompt.content }}</div>
          </div>

          <!-- Meta -->
          <div class="detail-meta">
            <span>Created {{ prompt.created_at | date:'medium' }}</span>
            <span>ID: #{{ prompt.id }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-wrapper { padding: 32px 0 60px; }

    .back-link {
      display: inline-flex; align-items: center;
      color: var(--text-secondary); text-decoration: none;
      font-size: 0.9rem; font-weight: 500; margin-bottom: 24px;
      transition: color 0.2s;
    }
    .back-link:hover { color: var(--accent-light); }

    .detail-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 36px;
    }

    /* Title row with action buttons */
    .title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .detail-header h1 {
      font-size: 2rem; font-weight: 800; letter-spacing: -0.02em;
      background: linear-gradient(135deg, var(--text-primary), var(--accent-light));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; flex: 1;
    }

    .action-row {
      display: flex; gap: 10px; align-items: center; flex-shrink: 0;
      padding-top: 6px;
    }
    .btn-action {
      border: none; border-radius: 8px; padding: 9px 18px;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-edit {
      background: rgba(124, 92, 252, 0.12);
      color: #a78bfa;
      border: 1px solid rgba(124, 92, 252, 0.3);
    }
    .btn-edit:hover {
      background: #7c3aed; color: white;
      box-shadow: 0 0 16px rgba(124,58,237,0.5);
    }
    .btn-delete {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }
    .btn-delete:hover {
      background: #ef4444; color: white;
      box-shadow: 0 0 16px rgba(239,68,68,0.5);
    }

    .detail-badges { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
    .badge-author { background: rgba(99,102,241,0.15); color: #818cf8; }

    .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
    .tag-pill {
      font-size: 0.75rem; padding: 3px 9px;
      background: rgba(139,92,246,0.15); color: #c4b5fd;
      border-radius: 4px; font-weight: 500;
    }

    /* Complexity bar */
    .complexity-bar-wrapper { margin-bottom: 28px; }
    .complexity-label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
    .complexity-bar { height: 6px; background: var(--bg-primary); border-radius: 3px; overflow: hidden; }
    .complexity-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
    .complexity-fill.low  { background: var(--success); }
    .complexity-fill.mid  { background: var(--warning); }
    .complexity-fill.high { background: var(--error); }

    .section-label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }

    .content-box {
      background: var(--bg-primary); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 20px 24px;
      font-size: 0.95rem; line-height: 1.8; color: var(--text-secondary);
      white-space: pre-wrap; word-break: break-word;
    }

    .detail-meta {
      display: flex; justify-content: space-between;
      margin-top: 24px; padding-top: 18px;
      border-top: 1px solid var(--border);
      font-size: 0.8rem; color: var(--text-muted);
    }
  `],
})
export class PromptDetailComponent implements OnInit {
  prompt: Prompt | null = null;
  loading = true;
  error = '';
  authenticated = false;
  username = '';
  confirmDelete = false;

  constructor(
    private route: ActivatedRoute,
    private promptService: PromptService,
    private authService: AuthService,
    private router: Router,
  ) {}

  /** Show edit/delete if: logged in AND (author matches or prompt has no author) */
  get canEdit(): boolean {
    if (!this.prompt) return false;
    return !this.prompt.author || this.prompt.author === this.username;
  }

  ngOnInit(): void {
    this.authService.authStatus$.subscribe((s) => {
      if (s !== null) {
        this.authenticated = s.authenticated;
        this.username = s.username || '';
      }
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.error = 'Invalid prompt ID.';
      this.loading = false;
      return;
    }

    this.promptService.getPrompt(id).subscribe({
      next: (data) => { this.prompt = data; this.loading = false; },
      error: () => {
        this.error = 'Prompt not found or server is unreachable.';
        this.loading = false;
      },
    });
  }

  onEdit() {
    if (this.prompt) this.router.navigate(['/edit-prompt', this.prompt.id]);
  }

  onDelete() {
    if (!this.prompt) return;
    this.promptService.deletePrompt(this.prompt.id).subscribe({
      next: () => this.router.navigate(['/prompts']),
      error: (err) => alert(err.error?.error || 'Failed to delete.'),
    });
  }
}
