import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/config/api-endpoints';
import { DocumentFilters, Facets, LibraryDocument, Page } from '@shared/models/document.model';
import { openBlobInNewTab, saveBlob } from '@shared/utils/file-download.util';

/** HTTP client for the library endpoints (catalogue, ingestion, XML exchange). */
@Injectable({ providedIn: 'root' })
export class DocumentApiService {
  private readonly http = inject(HttpClient);

  search(filters: DocumentFilters): Observable<Page<LibraryDocument>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== undefined && value !== null) params = params.set(key, String(value));
    }
    return this.http.get<Page<LibraryDocument>>(API_ENDPOINTS.documents.base, { params });
  }

  getFacets(): Observable<Facets> {
    return this.http.get<Facets>(API_ENDPOINTS.documents.facets);
  }

  uploadReport(formData: FormData): Observable<unknown> {
    return this.http.post(API_ENDPOINTS.documents.upload, formData);
  }

  importXml(xml: string): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(API_ENDPOINTS.documents.importXml, xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  /** Authenticated downloads must go through HttpClient: a plain link would miss the Bearer header. */
  openPdf(id: string): void {
    this.http.get(API_ENDPOINTS.documents.file(id), { responseType: 'blob' }).subscribe(openBlobInNewTab);
  }

  downloadDublinCore(id: string): void {
    this.http
      .get(API_ENDPOINTS.documents.dublinCore(id), { responseType: 'blob' })
      .subscribe((blob) => saveBlob(blob, `${id}-dublin-core.xml`));
  }

  downloadLibraryXml(): void {
    this.http
      .get(API_ENDPOINTS.documents.exportXml, { responseType: 'blob' })
      .subscribe((blob) => saveBlob(blob, 'library.xml'));
  }
}
