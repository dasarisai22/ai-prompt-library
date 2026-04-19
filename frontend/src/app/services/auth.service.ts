import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
  private TOKEN_KEY = 'auth_token';
  private USERNAME_KEY = 'auth_username';

  private authStatusSubject = new BehaviorSubject<AuthStatus>(
    this.getStoredStatus()
  );
  authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Read stored token status from localStorage (works across page reloads) */
  private getStoredStatus(): AuthStatus {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const username = localStorage.getItem(this.USERNAME_KEY);
    return token ? { authenticated: true, username: username || '' } : { authenticated: false };
  }

  /** Returns the Authorization header for all API requests */
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token
      ? new HttpHeaders({ 'Authorization': `Token ${token}` })
      : new HttpHeaders();
  }

  /** Store token and username after login/signup */
  private storeAuth(token: string, username: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USERNAME_KEY, username);
    this.authStatusSubject.next({ authenticated: true, username });
  }

  /** Remove token on logout */
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    this.authStatusSubject.next({ authenticated: false });
  }

  /** Check auth status from server */
  checkStatus(): Observable<AuthStatus> {
    return this.http.get<AuthStatus>(`${this.authUrl}/status/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(status => this.authStatusSubject.next(status))
    );
  }

  signup(data: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/signup/`, data).pipe(
      tap(res => {
        if (res.token) {
          this.storeAuth(res.token, res.username);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login/`, credentials).pipe(
      tap(res => {
        if (res.token) {
          this.storeAuth(res.token, res.username);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.authUrl}/logout/`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.clearAuth())
    );
  }

  /** Get current known status synchronously */
  get currentStatus(): AuthStatus {
    return this.authStatusSubject.getValue();
  }
}
