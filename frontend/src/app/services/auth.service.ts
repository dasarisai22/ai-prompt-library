import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthStatus {
  authenticated: boolean;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.apiUrl}/auth`;

  // null = not yet fetched, object = result known
  private authStatusSubject = new BehaviorSubject<AuthStatus | null>(null);
  authStatus$ = this.authStatusSubject.asObservable();

  // Shared observable — prevents duplicate HTTP calls on app load
  private statusCheck$: Observable<AuthStatus>;

  constructor(private http: HttpClient) {
    this.statusCheck$ = this.http
      .get<AuthStatus>(`${this.authUrl}/status/`, { withCredentials: true })
      .pipe(
        tap(status => this.authStatusSubject.next(status)),
        shareReplay(1)
      );

    // Kick off status check immediately when service is created
    this.statusCheck$.subscribe();
  }

  /** Returns the real server status (waits for HTTP response) */
  checkStatus(): Observable<AuthStatus> {
    return this.http.get<AuthStatus>(`${this.authUrl}/status/`, { withCredentials: true }).pipe(
      tap(status => this.authStatusSubject.next(status))
    );
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.authUrl}/signup/`, data, { withCredentials: true }).pipe(
      tap(() => this.checkStatus().subscribe())
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.authUrl}/login/`, credentials, { withCredentials: true }).pipe(
      tap(() => this.checkStatus().subscribe())
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.authUrl}/logout/`, {}, { withCredentials: true }).pipe(
      tap(() => this.authStatusSubject.next({ authenticated: false }))
    );
  }

  /** Get current known status synchronously (may be null if not loaded yet) */
  get currentStatus(): AuthStatus | null {
    return this.authStatusSubject.getValue();
  }
}
