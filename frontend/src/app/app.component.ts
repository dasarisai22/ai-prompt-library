import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, AuthStatus } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- ── Starfield ─────────────────────────── -->
    <div class="starfield">
      <div *ngFor="let star of stars" class="star"
           [style.top]="star.top" 
           [style.left]="star.left" 
           [style.animationDelay]="star.animationDelay"></div>
    </div>

    <!-- ── Sticky Navbar ─────────────────────── -->
    <nav class="navbar">
      <div class="navbar-inner">
        <a routerLink="/about" class="navbar-brand">
          ✦ AI Prompt Library
        </a>
        <div class="navbar-links">
          <a routerLink="/prompts"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: true }"
             class="nav-link">
            Browse
          </a>
          <!-- Show Login when not authenticated -->
          <a *ngIf="!authenticated"
             routerLink="/login"
             routerLinkActive="active"
             class="nav-link">
            Login
          </a>
          <!-- Show Add Prompt + Logout when authenticated -->
          <ng-container *ngIf="authenticated">
            <a routerLink="/add-prompt"
               routerLinkActive="active"
               class="nav-link btn btn-primary btn-glow" style="padding:8px 18px;">
              + Add Prompt
            </a>
            <button class="nav-link btn-logout" (click)="onLogout()">
              Logout ({{ username }})
            </button>
          </ng-container>
        </div>
      </div>
    </nav>

    <!-- ── Page Content ───────────────────────── -->
    <main style="position: relative; z-index: 10;">
      <router-outlet />
    </main>
  `,
  styles: [`
    .starfield {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .star {
      position: absolute;
      width: 2px; height: 2px;
      background: #fff;
      border-radius: 50%;
      opacity: 0;
      animation: twinkle 4s infinite ease-in-out;
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0; transform: scale(0.5); }
      50% { opacity: 0.8; transform: scale(1.5); box-shadow: 0 0 4px #fff; }
    }
    .btn-logout {
      background: transparent;
      border: 1px solid rgba(248, 113, 113, 0.4);
      color: #f87171;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }
    .btn-logout:hover {
      background: rgba(248, 113, 113, 0.15);
    }
  `]
})
export class AppComponent implements OnInit {
  stars: any[] = [];
  authenticated = false;
  username = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Twinkling stars background
    this.stars = Array.from({ length: 60 }).map(() => ({
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      animationDelay: Math.random() * 4 + 's'
    }));

    // Keep navbar in sync with auth state (null = loading, ignore it)
    this.authService.authStatus$.subscribe((status) => {
      if (status !== null) {
        this.authenticated = status.authenticated;
        this.username = status.username || '';
      }
    });
  }

  onLogout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
