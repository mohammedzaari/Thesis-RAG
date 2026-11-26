import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DocumentApiService } from '@core/api/document-api.service';
import { DocumentFilters, Facets, LibraryDocument } from '@shared/models/document.model';
import { DocumentCardComponent } from '../../components/document-card/document-card.component';
import { SearchFiltersComponent } from '../../components/search-filters/search-filters.component';

const PAGE_SIZE = 10;

/** Container page: owns the catalogue state and talks to the API. */
@Component({
  selector: 'app-library-page',
  standalone: true,
  imports: [SearchFiltersComponent, DocumentCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './library-page.component.html',
  styleUrl: './library-page.component.css',
})
export class LibraryPageComponent implements OnInit {
  private readonly documentApi = inject(DocumentApiService);
  private currentFilters: DocumentFilters = {};

  protected readonly pageSize = PAGE_SIZE;
  protected readonly items = signal<LibraryDocument[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly facets = signal<Facets>({ years: [], companies: [], technologies: [] });

  ngOnInit(): void {
    this.documentApi.getFacets().subscribe((facets) => this.facets.set(facets));
    this.load(1);
  }

  protected onSearch(filters: DocumentFilters): void {
    this.currentFilters = filters;
    this.load(1);
  }

  protected load(page: number): void {
    this.documentApi.search({ ...this.currentFilters, page, limit: PAGE_SIZE }).subscribe((result) => {
      this.items.set(result.items);
      this.total.set(result.total);
      this.page.set(page);
    });
  }

  protected openPdf(id: string): void {
    this.documentApi.openPdf(id);
  }

  protected exportRecord(id: string): void {
    this.documentApi.downloadDublinCore(id);
  }
}
