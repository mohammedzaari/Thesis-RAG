import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DocumentFilters, DocumentKind, Facets } from '@shared/models/document.model';

/** Search form. Emits the chosen filters; does not know how they are used. */
@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-filters.component.html',
  styleUrl: './search-filters.component.css',
})
export class SearchFiltersComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly facets = input.required<Facets>();
  readonly searchRequested = output<DocumentFilters>();

  protected readonly form = this.formBuilder.nonNullable.group({
    q: '',
    kind: '' as DocumentKind | '',
    year: '' as number | '',
    company: '',
    technology: '',
  });

  protected submit(): void {
    this.searchRequested.emit(this.form.getRawValue());
  }
}
