import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LibraryDocument } from '@shared/models/document.model';

/** Displays one catalogue entry and emits user intents (open PDF, export record). */
@Component({
  selector: 'app-document-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-card.component.html',
  styleUrl: './document-card.component.css',
})
export class DocumentCardComponent {
  readonly document = input.required<LibraryDocument>();
  readonly pdfRequested = output<string>();
  readonly exportRequested = output<string>();

  protected readonly canOpenPdf = computed(
    () => Boolean(this.document().filePath) && this.document().visibility === 'public',
  );
}
