import mongoose from 'mongoose';

export const DOCUMENT_KINDS = Object.freeze({
  REPORT: 'report', // past student thesis / internship report
  GUIDE: 'guide', // methodological or architecture guide
});

export const VISIBILITY = Object.freeze({
  PUBLIC: 'public', // metadata + full text + RAG
  RESTRICTED: 'restricted', // metadata only, excluded from RAG and download
});

const libraryDocumentSchema = new mongoose.Schema(
  {
    externalId: { type: String, unique: true, sparse: true }, // id used in XML exchanges
    kind: { type: String, enum: Object.values(DOCUMENT_KINDS), required: true, index: true },
    title: { type: String, required: true, trim: true },
    abstract: { type: String, default: '' },
    language: { type: String, default: 'fr' },
    year: { type: Number, min: 1990, max: 2100, index: true },
    program: { type: String, default: '' },
    authorName: { type: String, default: '' },
    supervisorName: { type: String, default: '' },
    companyName: { type: String, default: '', index: true },
    city: { type: String, default: '' },
    keywords: { type: [String], default: [] },
    technologies: { type: [String], default: [], index: true },
    visibility: { type: String, enum: Object.values(VISIBILITY), default: VISIBILITY.PUBLIC },
    filePath: { type: String, default: null },
    chunkCount: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

// Full-text index on the descriptive fields (language-neutral analyzer).
libraryDocumentSchema.index(
  { title: 'text', abstract: 'text', keywords: 'text', companyName: 'text' },
  { default_language: 'none', name: 'document_text_idx' },
);

export const LibraryDocument = mongoose.model('LibraryDocument', libraryDocumentSchema);
