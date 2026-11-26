import { Chunk } from '../models/Chunk.js';

/** Data-access layer for retrieval chunks. */
export class ChunkRepository {
  insertMany(chunks) {
    return Chunk.insertMany(chunks, { ordered: false });
  }

  deleteByDocumentId(documentId) {
    return Chunk.deleteMany({ documentId });
  }

  /** Keyword retrieval ranked by MongoDB's text score. */
  searchByText(query, visibilityFilter, limit) {
    return Chunk.find(
      { $text: { $search: query }, ...visibilityFilter },
      { text: 1, documentId: 1, position: 1, score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();
  }

  /** Loads candidate chunks with their embeddings for in-process cosine ranking. */
  findWithEmbeddings(visibilityFilter, cap) {
    return Chunk.find({ ...visibilityFilter, embedding: { $exists: true } })
      .select('+embedding')
      .limit(cap)
      .lean();
  }
}
