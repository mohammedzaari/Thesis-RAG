/**
 * Splits raw text into overlapping, paragraph-aware chunks.
 * Overlap preserves context that would otherwise be cut at chunk borders.
 */
export class ChunkingService {
  /**
   * @param {{maxLength?: number, overlap?: number}} [options]
   */
  constructor({ maxLength = 1000, overlap = 150 } = {}) {
    this.maxLength = maxLength;
    this.overlap = overlap;
  }

  /** @param {string} text @returns {string[]} */
  split(text) {
    const paragraphs = text
      .replace(/\r/g, '')
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    const chunks = [];
    let current = '';

    for (const paragraph of paragraphs) {
      // A single oversized paragraph is hard-split first.
      const pieces = paragraph.length > this.maxLength ? this.hardSplit(paragraph) : [paragraph];
      for (const piece of pieces) {
        if (current && current.length + piece.length + 1 > this.maxLength) {
          chunks.push(current);
          current = `${current.slice(-this.overlap)} ${piece}`.trim();
        } else {
          current = current ? `${current} ${piece}` : piece;
        }
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  hardSplit(text) {
    const step = this.maxLength - this.overlap;
    const pieces = [];
    for (let start = 0; start < text.length; start += step) {
      pieces.push(text.slice(start, start + this.maxLength));
    }
    return pieces;
  }
}
