import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocumentApiService } from '@core/api/document-api.service';

/** XML bulk import (validated by library.xsd on the server) and catalogue export. */
@Component({
  selector: 'app-xml-exchange',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './xml-exchange.component.html',
  styleUrl: './xml-exchange.component.css',
})
export class XmlExchangeComponent {
  private readonly documentApi = inject(DocumentApiService);

  protected readonly message = signal('');
  protected readonly error = signal('');

  protected async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.message.set('');
    this.error.set('');

    this.documentApi.importXml(await file.text()).subscribe({
      next: ({ imported }) => this.message.set(`${imported} document(s) importé(s).`),
      error: (error: HttpErrorResponse) => this.error.set(this.describe(error)),
    });
  }

  protected exportCatalogue(): void {
    this.documentApi.downloadLibraryXml();
  }

  /** Builds a readable message including the first schema violations. */
  private describe(error: HttpErrorResponse): string {
    const details: unknown = error.error?.details;
    const hint = Array.isArray(details) ? ` (${details.slice(0, 2).join(' ; ')})` : '';
    return `${error.error?.message ?? "Échec de l'import XML."}${hint}`;
  }
}
