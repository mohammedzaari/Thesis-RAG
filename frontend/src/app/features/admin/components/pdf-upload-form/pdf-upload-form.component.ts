import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentApiService } from '@core/api/document-api.service';

/** Ingests a PDF report together with its metadata. */
@Component({
  selector: 'app-pdf-upload-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pdf-upload-form.component.html',
  styleUrl: './pdf-upload-form.component.css',
})
export class PdfUploadFormComponent {
  private readonly documentApi = inject(DocumentApiService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly file = signal<File | null>(null);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1990), Validators.max(2100)]],
    authorName: [''],
    supervisorName: [''],
    companyName: [''],
    technologies: [''],
    keywords: [''],
    abstract: [''],
    visibility: ['public'],
  });

  protected onFileSelected(event: Event): void {
    this.file.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }

  protected submit(): void {
    const file = this.file();
    if (!file || this.form.invalid) return;

    const payload = new FormData();
    payload.append('file', file);
    payload.append('kind', 'report');
    Object.entries(this.form.getRawValue()).forEach(([key, value]) => payload.append(key, String(value)));

    this.busy.set(true);
    this.message.set('');
    this.error.set('');

    this.documentApi.uploadReport(payload).subscribe({
      next: () => {
        this.message.set('Rapport importé et indexé.');
        this.busy.set(false);
        this.form.reset();
        this.file.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(error.error?.message ?? "Échec de l'import.");
      },
    });
  }
}
