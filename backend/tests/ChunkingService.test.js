import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ChunkingService } from '../src/services/ChunkingService.js';

test('splits long text into chunks no larger than maxLength + overlap', () => {
  const service = new ChunkingService({ maxLength: 200, overlap: 30 });
  const text = Array.from({ length: 20 }, (_, i) => `Paragraph ${i} ${'word '.repeat(15)}`).join('\n\n');
  const chunks = service.split(text);
  assert.ok(chunks.length > 1);
  chunks.forEach((chunk) => assert.ok(chunk.length <= 200 + 30 + 1));
});

test('hard-splits a single oversized paragraph', () => {
  const service = new ChunkingService({ maxLength: 100, overlap: 10 });
  assert.ok(service.split('x'.repeat(450)).length >= 4);
});

test('returns no chunk for empty text', () => {
  assert.deepEqual(new ChunkingService().split('  \n\n '), []);
});
