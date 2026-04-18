import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PromptService } from '../../services/prompt.service';
import { AuthService, AuthStatus } from '../../services/auth.service';
import { Prompt } from '../../models/prompt.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prompt-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <h1>Browse Prompts</h1>
        <p>Explore AI image prompts curated by the community</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner"></div>
        <span>Loading prompts...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="alert alert-error">
        ⚠ {{ error }}
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && prompts.length === 0" class="empty-state">
        <div style="font-size: 3rem; margin-bottom: 12px;">✨</div>
        <h3>No prompts yet</h3>
        <p style="margin: 12px 0 24px;">Be the first to add an AI image prompt!</p>
        <a routerLink="/add-prompt" class="btn btn-primary">+ Add Prompt</a>
      </div>

      <!-- Tag Filter Pills -->
      <div class="filter-pills" *ngIf="!loading && allTags.length > 0">
        <button class="pill" [class.active]="activeTag === ''" (click)="filterByTag('')">All</button>
        <button *ngFor="let tag of allTags" class="pill" [class.active]="activeTag === tag" (click)="filterByTag(tag)">
          #{{ tag }}
        </button>
      </div>

      <!-- Prompts Grid -->
      <div class="prompt-grid" *ngIf="!loading && filteredPrompts.length > 0">
        <a *ngFor="let prompt of filteredPrompts"
           [routerLink]="['/prompts', prompt.id]"
           class="card prompt-card"
           [id]="'prompt-card-' + prompt.id">

          <!-- Complexity Badge -->
          <div class="complexity-badge"
               [class.low]="prompt.complexity <= 3"
               [class.mid]="prompt.complexity > 3 && prompt.complexity <= 7"
               [class.high]="prompt.complexity > 7">
            ⚡ {{ prompt.complexity }}/10
          </div>

          <!-- Title -->
          <h3 class="prompt-card__title">{{ prompt.title }}</h3>

          <!-- Preview -->
          <p class="prompt-card__preview">
            {{ prompt.content.length > 100 ? prompt.content.substring(0, 100) + '...' : prompt.content }}
          </p>

          <!-- Tags -->
          <div class="tag-row" *ngIf="prompt.tags && prompt.tags.length > 0">
            <span *ngFor="let tag of prompt.tags" class="tag-pill">#{{ tag }}</span>
          </div>

          <!-- Footer -->
          <div class="prompt-card__footer">
            <div class="footer-left">
              <span class="badge badge-views">👁 {{ prompt.view_count }} views</span>
              <span class="prompt-card__date">{{ prompt.created_at | date:'mediumDate' }}</span>
              <span class="prompt-author" *ngIf="prompt.author">by @{{ prompt.author }}</span>
            </div>
            <!-- Edit/Delete: show if logged in AND (no author = legacy, OR own prompt) -->
            <div class="card-actions" *ngIf="authenticated && (!prompt.author || prompt.author === username)">
              <button class="action-btn edit-btn"
                (click)="$event.preventDefault(); $event.stopPropagation(); editPrompt(prompt.id)">
                ✏ Edit
              </button>
              <ng-container *ngIf="confirmDeleteId !== prompt.id">
                <button class="action-btn delete-btn"
                  (click)="$event.preventDefault(); $event.stopPropagation(); confirmDeleteId = prompt.id">
                  🗑 Delete
                </button>
              </ng-container>
              <ng-container *ngIf="confirmDeleteId === prompt.id">
                <span style="font-size:0.75rem; color:#f87171;" (click)="$event.preventDefault(); $event.stopPropagation()">Sure?</span>
                <button class="action-btn delete-btn"
                  (click)="$event.preventDefault(); $event.stopPropagation(); deletePrompt(prompt.id)">
                  Yes
                </button>
                <button class="action-btn edit-btn"
                  (click)="$event.preventDefault(); $event.stopPropagation(); confirmDeleteId = null">
                  No
                </button>
              </ng-container>
            </div>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .prompt-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      padding-bottom: 60px;
    }
    .prompt-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      border-radius: 16px;
      padding: 24px;
      min-height: 240px;
      transition: all 0.3s ease;
    }
    .prompt-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 10px 30px rgba(124, 92, 252, 0.2);
      border-color: rgba(124, 92, 252, 0.3);
    }
    .complexity-badge {
      position: absolute;
      top: 16px; right: 16px;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 50px;
    }
    .complexity-badge.low  { background: rgba(16,185,129,0.15); color: #34d399; }
    .complexity-badge.mid  { background: rgba(245,158,11,0.15);  color: #fbbf24; }
    .complexity-badge.high { background: rgba(239,68,68,0.15);   color: #f87171; }

    .prompt-card__title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f1f5f9;
      padding-right: 60px;
    }
    .prompt-card__preview {
      font-size: 0.95rem;
      line-height: 1.6;
      color: #94a3b8;
      flex: 1;
    }
    .tag-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag-pill {
      font-size: 0.75rem;
      padding: 3px 9px;
      background: rgba(139, 92, 246, 0.15);
      color: #c4b5fd;
      border-radius: 4px;
      font-weight: 500;
    }
    .prompt-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      gap: 8px;
      flex-wrap: wrap;
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .prompt-card__date { font-size: 0.8rem; color: #64748b; }
    .prompt-author { font-size: 0.8rem; color: #94a3b8; }

    .card-actions { display: flex; gap: 6px; }
    .action-btn {
      font-size: 0.8rem; border: none; padding: 5px 10px;
      border-radius: 6px; font-weight: 600; cursor: pointer;
      transition: all 0.2s ease; z-index: 2; position: relative;
    }
    .edit-btn { color: #a78bfa; background: rgba(124,92,252,0.1); }
    .edit-btn:hover { background: #7c3aed; color: white; }
    .delete-btn { color: #f87171; background: rgba(248,113,113,0.1); }
    .delete-btn:hover { background: #ef4444; color: white; }

    /* Filter pills */
    .filter-pills {
      display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap;
    }
    .pill {
      background: rgba(30,41,59,0.5); color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 6px 18px; border-radius: 99px;
      cursor: pointer; font-size: 0.9rem; font-weight: 500;
      transition: all 0.2s ease;
    }
    .pill:hover { border-color: rgba(124,92,252,0.4); color: #f1f5f9; }
    .pill.active { background: var(--accent); color: white; border-color: var(--accent); }
  `],
})
export class PromptListComponent implements OnInit {
  prompts: Prompt[] = [];
  filteredPrompts: Prompt[] = [];
  allTags: string[] = [];
  activeTag = '';
  loading = true;
  error = '';
  authenticated = false;
  username = '';
  confirmDeleteId: number | null = null;

  constructor(
    private promptService: PromptService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authStatus$.subscribe((status) => {
      if (status !== null) {
        this.authenticated = status.authenticated;
        this.username = status.username || '';
      }
    });

    this.loadPrompts();
  }

  loadPrompts(tag?: string) {
    this.loading = true;
    this.promptService.getPrompts(tag).subscribe({
      next: (data) => {
        this.prompts = data;
        this.filteredPrompts = data;

        // Build unique tag list from all prompts
        const tagSet = new Set<string>();
        data.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
        this.allTags = Array.from(tagSet).sort();

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Unable to fetch prompts. Is the backend running?';
        this.loading = false;
        console.error(err);
      }
    });
  }

  filterByTag(tag: string) {
    this.activeTag = tag;
    if (!tag) {
      this.filteredPrompts = this.prompts;
    } else {
      this.filteredPrompts = this.prompts.filter(p => p.tags && p.tags.includes(tag));
    }
  }

  editPrompt(id: number) {
    this.router.navigate(['/edit-prompt', id]);
  }

  deletePrompt(id: number) {
    this.promptService.deletePrompt(id).subscribe({
      next: () => {
        this.prompts = this.prompts.filter(p => p.id !== id);
        this.confirmDeleteId = null;
        this.filterByTag(this.activeTag);
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to delete prompt.');
        this.confirmDeleteId = null;
      }
    });
  }
}
