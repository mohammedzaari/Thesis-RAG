import { env } from '../config/env.js';

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings';
const BATCH_SIZE = 64;

/**
 * Dense embeddings through the Voyage AI API (optional component).
 * When no key is configured the RAG pipeline falls back to MongoDB text search.
 */
export class EmbeddingService {
  get isEnabled() {
    return Boolean(env.voyageApiKey);
  }

  /**
   * @param {string[]} texts
   * @param {'document'|'query'} inputType
   * @returns {Promise<number[][]>}
   */
  async embed(texts, inputType = 'document') {
    const vectors = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const response = await fetch(VOYAGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.voyageApiKey}` },
        body: JSON.stringify({ input: batch, model: env.voyageModel, input_type: inputType }),
      });
      if (!response.ok) throw new Error(`Embedding API error (${response.status})`);
      const { data } = await response.json();
      vectors.push(...data.map((item) => item.embedding));
    }
    return vectors;
  }

  /** Cosine similarity between two vectors of equal length. */
  static cosine(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }
}
