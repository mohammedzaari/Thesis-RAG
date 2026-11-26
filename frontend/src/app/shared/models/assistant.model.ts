import { DocumentKind } from './document.model';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Source {
  documentId: string;
  title: string;
  kind: DocumentKind;
  year: number;
  position: number;
  excerpt: string;
}

export interface AskResponse {
  answer: string;
  sources: Source[];
  mode: 'llm' | 'extractive' | 'none';
}

/** A displayed conversation turn: a message plus the sources that backed it. */
export interface ChatTurn extends ChatMessage {
  sources?: Source[];
}
