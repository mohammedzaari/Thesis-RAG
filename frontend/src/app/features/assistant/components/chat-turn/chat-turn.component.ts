import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ChatTurn } from '@shared/models/assistant.model';

/** One message of the conversation, with the sources that backed an answer. */
@Component({
  selector: 'app-chat-turn',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-turn.component.html',
  styleUrl: './chat-turn.component.css',
})
export class ChatTurnComponent {
  readonly turn = input.required<ChatTurn>();
}
