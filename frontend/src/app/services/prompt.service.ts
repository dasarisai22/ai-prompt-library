import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prompt, CreatePromptDto } from '../models/prompt.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private baseUrl = `${environment.apiUrl}/prompts`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** GET /prompts/?tag=xxx – fetch all (optionally filtered by tag) */
  getPrompts(tag?: string): Observable<Prompt[]> {
    const url = tag ? `${this.baseUrl}/?tag=${encodeURIComponent(tag)}` : `${this.baseUrl}/`;
    return this.http.get<Prompt[]>(url, { headers: this.auth.getAuthHeaders() });
  }

  /** GET /prompts/<id>/ – increments Redis view counter */
  getPrompt(id: number): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.baseUrl}/${id}/`, { headers: this.auth.getAuthHeaders() });
  }

  /** POST /prompts/ – create a new prompt (requires login) */
  createPrompt(data: CreatePromptDto): Observable<Prompt> {
    return this.http.post<Prompt>(`${this.baseUrl}/`, data, { headers: this.auth.getAuthHeaders() });
  }

  /** PUT /prompts/<id>/ – update (requires login + author) */
  updatePrompt(id: number, data: CreatePromptDto): Observable<Prompt> {
    return this.http.put<Prompt>(`${this.baseUrl}/${id}/`, data, { headers: this.auth.getAuthHeaders() });
  }

  /** DELETE /prompts/<id>/ – delete (requires login + author) */
  deletePrompt(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, { headers: this.auth.getAuthHeaders() });
  }
}
