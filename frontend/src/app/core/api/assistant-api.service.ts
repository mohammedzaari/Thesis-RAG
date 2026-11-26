import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/config/api-endpoints';
import { AskResponse, ChatMessage } from '@shared/models/assistant.model';

/** HTTP client for the RAG assistant. */
@Injectable({ providedIn: 'root' })
export class AssistantApiService {
  private readonly http = inject(HttpClient);

  ask(question: string, history: ChatMessage[]): Observable<AskResponse> {
    return this.http.post<AskResponse>(API_ENDPOINTS.assistant.ask, { question, history });
  }
}
