import mongoose from 'mongoose';

/**
 * A passage of a document: the retrieval unit of the RAG pipeline.
 * `visibility` is copied from the parent so access control can be applied
 * directly inside the retrieval query.
 */
const chunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryDocument', required: true, index: true },
  visibility: { type: String, required: true, index: true },
  position: { type: Number, required: true }, // order inside the document
  text: { type: String, required: true },
  embedding: { type: [Number], select: false, default: undefined }, // optional dense vector
});

chunkSchema.index({ text: 'text' }, { default_language: 'none', name: 'chunk_text_idx' });

export const Chunk = mongoose.model('Chunk', chunkSchema);
