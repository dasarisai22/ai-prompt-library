import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

/** Cross-field validator: password === confirmPassword */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">

        <!-- Logo / heading -->
        <div class="auth-logo">✦</div>
        <h1 class="auth-title">AI Prompt Library</h1>
        <p class="auth-sub">Create, discover and manage AI image prompts</p>

        <!-- Tab switcher -->
        <div class="tab-row">
          <button class="tab-btn" [class.active]="mode === 'login'" (click)="switchMode('login')">Login</button>
          <button class="tab-btn" [class.active]="mode === 'signup'" (click)="switchMode('signup')">Sign Up</button>
        </div>

        <!-- Global error / success -->
        <div *ngIf="serverError" class="alert alert-error">⚠ {{ serverError }}</div>
        <div *ngIf="successMsg"  class="alert alert-success">✅ {{ successMsg }}</div>

        <!-- ── LOGIN FORM ─────────────────────────────── -->
        <form *ngIf="mode === 'login'" [formGroup]="loginForm" (ngSubmit)="onLogin()" autocomplete="on">

          <div class="form-group">
            <label class="form-label" for="l-username">Username</label>
            <input id="l-username" type="text" class="form-control"
                   formControlName="username" placeholder="Enter your username"
                   [class.is-invalid]="li('username')" />
            <span class="error-msg" *ngIf="li('username')">✕ Username is required</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="l-password">Password</label>
            <div class="pw-wrap">
              <input id="l-password" [type]="showLoginPw ? 'text' : 'password'" class="form-control"
                     formControlName="password" placeholder="Enter your password"
                     [class.is-invalid]="li('password')" />
              <button type="button" class="eye-btn" (click)="showLoginPw = !showLoginPw">
                {{ showLoginPw ? '🙈' : '👁' }}
              </button>
            </div>
            <span class="error-msg" *ngIf="li('password')">✕ Password is required</span>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="submitting">
            <span *ngIf="!submitting">Login</span>
            <span *ngIf="submitting">Logging in…</span>
          </button>
          <p class="switch-hint">Don't have an account? <a (click)="switchMode('signup')" class="link">Sign up</a></p>
        </form>

        <!-- ── SIGNUP FORM ────────────────────────────── -->
        <form *ngIf="mode === 'signup'" [formGroup]="signupForm" (ngSubmit)="onSignup()" autocomplete="off">

          <!-- Username -->
          <div class="form-group">
            <label class="form-label" for="s-username">Username</label>
            <input id="s-username" type="text" class="form-control"
                   formControlName="username" placeholder="Choose a username (min 3 chars)"
                   [class.is-invalid]="si('username')" />
            <div class="error-msg" *ngIf="signupForm.get('username')?.errors?.['required'] && si('username')">✕ Username is required</div>
            <div class="error-msg" *ngIf="signupForm.get('username')?.errors?.['minlength'] && si('username')">✕ Must be at least 3 characters</div>
            <div class="error-msg" *ngIf="signupForm.get('username')?.errors?.['pattern'] && si('username')">✕ Only letters, numbers and underscores allowed</div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label" for="s-password">Password</label>
            <div class="pw-wrap">
              <input id="s-password" [type]="showSignupPw ? 'text' : 'password'" class="form-control"
                     formControlName="password" placeholder="Min 6 characters"
                     [class.is-invalid]="si('password')" />
              <button type="button" class="eye-btn" (click)="showSignupPw = !showSignupPw">
                {{ showSignupPw ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="error-msg" *ngIf="signupForm.get('password')?.errors?.['required'] && si('password')">✕ Password is required</div>
            <div class="error-msg" *ngIf="signupForm.get('password')?.errors?.['minlength'] && si('password')">✕ Must be at least 6 characters</div>

            <!-- Strength indicator -->
            <div class="strength-bar" *ngIf="signupForm.get('password')?.value">
              <div class="strength-fill"
                   [style.width]="strengthPercent + '%'"
                   [class.weak]="strengthLabel === 'Weak'"
                   [class.fair]="strengthLabel === 'Fair'"
                   [class.strong]="strengthLabel === 'Strong'">
              </div>
            </div>
            <span class="strength-label" *ngIf="signupForm.get('password')?.value"
                  [class.weak]="strengthLabel === 'Weak'"
                  [class.fair]="strengthLabel === 'Fair'"
                  [class.strong]="strengthLabel === 'Strong'">
              {{ strengthLabel }}
            </span>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label class="form-label" for="s-confirm">Confirm Password</label>
            <div class="pw-wrap">
              <input id="s-confirm" [type]="showConfirmPw ? 'text' : 'password'" class="form-control"
                     formControlName="confirmPassword" placeholder="Re-enter your password"
                     [class.is-invalid]="si('confirmPassword') || (signupForm.errors?.['passwordMismatch'] && signupForm.get('confirmPassword')?.touched)" />
              <button type="button" class="eye-btn" (click)="showConfirmPw = !showConfirmPw">
                {{ showConfirmPw ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="error-msg" *ngIf="signupForm.get('confirmPassword')?.errors?.['required'] && si('confirmPassword')">✕ Please confirm your password</div>
            <div class="error-msg" *ngIf="signupForm.errors?.['passwordMismatch'] && signupForm.get('confirmPassword')?.touched">✕ Passwords do not match</div>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="submitting">
            <span *ngIf="!submitting">Create Account</span>
            <span *ngIf="submitting">Creating…</span>
          </button>
          <p class="switch-hint">Already have an account? <a (click)="switchMode('login')" class="link">Login</a></p>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      padding: 40px 36px;
      backdrop-filter: blur(14px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1);
    }

    .auth-logo {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 8px;
      color: #a78bfa;
    }
    .auth-title {
      font-size: 1.5rem;
      font-weight: 800;
      text-align: center;
      color: #f1f5f9;
      margin: 0 0 4px;
    }
    .auth-sub {
      text-align: center;
      color: #64748b;
      font-size: 0.88rem;
      margin: 0 0 28px;
    }

    /* Tabs */
    .tab-row {
      display: flex;
      background: rgba(30,41,59,0.5);
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 28px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .tab-btn {
      flex: 1;
      padding: 9px 0;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #64748b;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .tab-btn.active {
      background: var(--accent, #7c3aed);
      color: white;
      box-shadow: 0 0 20px rgba(124,58,237,0.4);
    }

    /* Password eye toggle */
    .pw-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .pw-wrap .form-control { flex: 1; padding-right: 44px; }
    .eye-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      line-height: 1;
      color: #64748b;
    }

    /* Strength meter */
    .strength-bar {
      height: 4px;
      background: rgba(255,255,255,0.08);
      border-radius: 2px;
      margin-top: 8px;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.4s ease, background 0.4s ease;
    }
    .strength-fill.weak   { background: #ef4444; }
    .strength-fill.fair   { background: #f59e0b; }
    .strength-fill.strong { background: #10b981; }
    .strength-label { font-size: 0.75rem; margin-top: 4px; display: block; }
    .strength-label.weak   { color: #ef4444; }
    .strength-label.fair   { color: #f59e0b; }
    .strength-label.strong { color: #10b981; }

    .btn-full { width: 100%; padding: 13px; margin-top: 8px; border-radius: 10px; font-size: 1rem; }

    .switch-hint {
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
      margin-top: 18px;
    }
    .link {
      color: #a78bfa;
      cursor: pointer;
      font-weight: 600;
    }
    .link:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  mode: 'login' | 'signup' = 'login';
  submitting = false;
  serverError = '';
  successMsg = '';

  showLoginPw = false;
  showSignupPw = false;
  showConfirmPw = false;

  loginForm: FormGroup;
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.signupForm = this.fb.group(
      {
        username: [
          '',
          [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)],
        ],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );

    // Reactively update strength bar
    this.signupForm.get('password')!.valueChanges.subscribe(() => this._calcStrength());
  }

  /** Login field touched+invalid helper */
  li(field: string): boolean {
    const c = this.loginForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  /** Signup field touched+invalid helper */
  si(field: string): boolean {
    const c = this.signupForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  switchMode(m: 'login' | 'signup') {
    this.mode = m;
    this.serverError = '';
    this.successMsg = '';
  }

  onLogin() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.submitting = true;
    this.serverError = '';
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/prompts']);
      },
      error: (err) => {
        this.submitting = false;
        this.serverError = err.error?.error || 'Login failed. Please try again.';
      }
    });
  }

  onSignup() {
    this.signupForm.markAllAsTouched();
    if (this.signupForm.invalid) return;

    this.submitting = true;
    this.serverError = '';

    const { username, password, confirmPassword } = this.signupForm.value;
    this.authService.signup({ username, password, confirm_password: confirmPassword }).subscribe({
      next: () => {
        this.submitting = false;
        this.successMsg = 'Account created! Redirecting…';
        setTimeout(() => this.router.navigate(['/prompts']), 1000);
      },
      error: (err) => {
        this.submitting = false;
        if (err.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          this.serverError = err.error.errors[firstKey];
        } else {
          this.serverError = err.error?.error || 'Signup failed. Please try again.';
        }
      }
    });
  }

  // ── Password strength ─────────────────────────────────────────────────────
  strengthPercent = 0;
  strengthLabel   = '';

  private _calcStrength() {
    const pw: string = this.signupForm.get('password')?.value || '';
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) {
      this.strengthPercent = 33;
      this.strengthLabel   = 'Weak';
    } else if (score <= 3) {
      this.strengthPercent = 66;
      this.strengthLabel   = 'Fair';
    } else {
      this.strengthPercent = 100;
      this.strengthLabel   = 'Strong';
    }
  }
}
