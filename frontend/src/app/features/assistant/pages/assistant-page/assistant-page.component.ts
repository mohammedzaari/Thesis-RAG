import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssistantApiService } from '@core/api/assistant-api.service';
import { ChatMessage, ChatTurn } from '@shared/models/assistant.model';
import { ChatTurnComponent } from '../../components/chat-turn/chat-turn.component';

const HISTORY_WINDOW = 6; // the server caps the history as well

/** Container page: conversation state and calls to the RAG assistant. */
@Component({
  selector: 'app-assistant-page',
  standalone: true,
  imports: [ReactiveFormsModule, ChatTurnComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assistant-page.component.html',
  styleUrl: './assistant-page.component.css',
})
export class AssistantPageComponent {
  private readonly assistantApi = inject(AssistantApiService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly turns = signal<ChatTurn[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
  });

  protected send(): void {
    const question = this.form.controls.question.value.trim();
    if (!question) return;

    const history: ChatMessage[] = this.turns()
      .slice(-HISTORY_WINDOW)
      .map(({ role, content }) => ({ role, content }));

    this.turns.update((turns) => [...turns, { role: 'user', content: question }]);
    this.form.reset();
    this.loading.set(true);
    this.error.set('');

    this.assistantApi.ask(question, history).subscribe({
      next: (response) => {
        this.turns.update((turns) => [...turns, { role: 'assistant', content: response.answer, sources: response.sources }]);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.error?.message ?? "L'assistant est indisponible pour le moment.");
        this.loading.set(false);
      },
    });
  }
}
