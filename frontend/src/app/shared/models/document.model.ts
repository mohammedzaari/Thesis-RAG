export type DocumentKind = 'report' | 'guide';
export type Visibility = 'public' | 'restricted';

export interface LibraryDocument {
  _id: string;
  kind: DocumentKind;
  title: string;
  abstract: string;
  year: number;
  companyName: string;
  authorName: string;
  keywords: string[];
  technologies: string[];
  visibility: Visibility;
  filePath: string | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Facets {
  years: number[];
  companies: string[];
  technologies: string[];
}

export interface DocumentFilters {
  q?: string;
  kind?: DocumentKind | '';
  year?: number | '';
  company?: string;
  technology?: string;
  page?: number;
  limit?: number;
}
