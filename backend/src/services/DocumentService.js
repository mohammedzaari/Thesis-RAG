import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { env } from '../config/env.js';
import { USER_ROLES } from '../models/User.js';
import { VISIBILITY } from '../models/LibraryDocument.js';
import { HttpError } from '../utils/HttpError.js';

const EMBEDDING_FAILURE_MESSAGE = '[ingestion] Embeddings unavailable, falling back to text search:';

/** Library use cases: catalogue search, ingestion (PDF / XML), export. */
export class DocumentService {
  /**
   * @param {import('../repository/DocumentRepository.js').DocumentRepository} documentRepository
   * @param {import('../repository/ChunkRepository.js').ChunkRepository} chunkRepository
   * @param {import('./ChunkingService.js').ChunkingService} chunkingService
   * @param {import('./EmbeddingService.js').EmbeddingService} embeddingService
   * @param {import('./XmlService.js').XmlService} xmlService
   */
  constructor(documentRepository, chunkRepository, chunkingService, embeddingService, xmlService) {
    this.documentRepository = documentRepository;
    this.chunkRepository = chunkRepository;
    this.chunkingService = chunkingService;
    this.embeddingService = embeddingService;
    this.xmlService = xmlService;
  }

  /** Students only see metadata of public and restricted documents; content rules apply elsewhere. */
  async search(query) {
    const { q, kind, year, company, technology, page, limit } = query;
    const filter = {};
    if (kind) filter.kind = kind;
    if (year) filter.year = year;
    if (company) filter.companyName = company;
    if (technology) filter.technologies = technology;
    if (q) filter.$text = { $search: q };

    const result = await this.documentRepository.search(filter, { page, limit, byRelevance: Boolean(q) });
    return { ...result, page, limit };
  }

  getFacets() {
    return this.documentRepository.getFacets({});
  }

  async getById(id) {
    const document = await this.documentRepository.findById(id);
    if (!document) throw new HttpError(404, 'Document not found');
    return document;
  }

  /** Creates a report from an uploaded PDF and indexes its text. */
  async ingestPdf(file, metadata, uploaderId) {
    if (!file) throw new HttpError(400, 'A PDF file is required');
    // MIME type is client-controlled: verify the real file signature.
    if (file.buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
      throw new HttpError(415, 'The uploaded file is not a valid PDF');
    }

    const { text, numpages } = await pdfParse(file.buffer);
    if (!text.trim()) {
      throw new HttpError(422, 'No extractable text found (scanned PDF? OCR is required)');
    }

    const storedName = `${crypto.randomUUID()}.pdf`; // never reuse the client file name
    const uploadDir = path.resolve(env.uploadDir);
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, storedName), file.buffer);

    const document = await this.documentRepository.create({
      ...metadata,
      filePath: storedName,
      uploadedBy: uploaderId,
    });
    await this.indexText(document, text);
    return { document, pages: numpages };
  }

  /** Bulk import from an XSD-validated XML; existing ids are updated (idempotent). */
  async importXml(xml, uploaderId) {
    const entries = await this.xmlService.parseLibrary(xml);
    let imported = 0;
    for (const { metadata, content } of entries) {
      const document = await this.documentRepository.upsertByExternalId(metadata.externalId, {
        ...metadata,
        uploadedBy: uploaderId,
      });
      if (content.trim()) await this.indexText(document, content);
      imported += 1;
    }
    return { imported };
  }

  /** Chunks a text, optionally embeds it, and replaces the document's previous chunks. */
  async indexText(document, text) {
    const pieces = this.chunkingService.split(text);
    let vectors = [];
    if (this.embeddingService.isEnabled) {
      try {
        vectors = await this.embeddingService.embed(pieces, 'document');
      } catch (error) {
        console.warn(EMBEDDING_FAILURE_MESSAGE, error.message);
      }
    }
    await this.chunkRepository.deleteByDocumentId(document._id);
    await this.chunkRepository.insertMany(
      pieces.map((piece, index) => ({
        documentId: document._id,
        visibility: document.visibility,
        position: index + 1,
        text: piece,
        ...(vectors[index] ? { embedding: vectors[index] } : {}),
      })),
    );
    await this.documentRepository.updateById(document._id, { chunkCount: pieces.length });
  }

  async update(id, changes) {
    const document = await this.documentRepository.updateById(id, changes);
    if (!document) throw new HttpError(404, 'Document not found');
    return document;
  }

  async remove(id) {
    const document = await this.documentRepository.deleteById(id);
    if (!document) throw new HttpError(404, 'Document not found');
    await this.chunkRepository.deleteByDocumentId(id);
    if (document.filePath) {
      await fs.rm(path.resolve(env.uploadDir, document.filePath), { force: true });
    }
  }

  /** Resolves the absolute PDF path if the user is allowed to download it. */
  async getFilePath(id, user) {
    const document = await this.getById(id);
    const isAdmin = user.role === USER_ROLES.ADMIN;
    if (!document.filePath) throw new HttpError(404, 'No file attached to this document');
    if (document.visibility === VISIBILITY.RESTRICTED && !isAdmin) {
      throw new HttpError(403, 'This report is restricted');
    }
    return path.resolve(env.uploadDir, document.filePath);
  }

  async exportLibraryXml() {
    return this.xmlService.buildLibrary(await this.documentRepository.findAll());
  }

  async exportDublinCore(id) {
    return this.xmlService.buildDublinCore((await this.getById(id)).toObject());
  }
}
