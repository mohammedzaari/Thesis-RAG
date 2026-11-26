import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { XmlService } from '../src/services/XmlService.js';

const service = new XmlService();
const seedXml = fs.readFileSync(new URL('../resources/seed/library.xml', import.meta.url), 'utf8');

test('the seed library is valid against the XSD and fully parsed', async () => {
  const entries = await service.parseLibrary(seedXml);
  assert.equal(entries.length, 4);
  assert.equal(entries[1].metadata.kind, 'guide');
  assert.ok(entries[1].metadata.technologies.includes('Docker'));
});

test('rejects XML violating the schema (unknown kind)', async () => {
  const invalid = seedXml.replace('kind="guide"', 'kind="novel"');
  await assert.rejects(service.parseLibrary(invalid), { status: 422 });
});

test('rejects duplicated document ids', async () => {
  const duplicated = seedXml.replace('guide-architecture-choices', 'guide-report-structure');
  await assert.rejects(service.parseLibrary(duplicated), { status: 422 });
});

test('rejects DTD / entity declarations (XXE protection)', async () => {
  const malicious = `<?xml version="1.0"?><!DOCTYPE library [<!ENTITY x "boom">]>${seedXml.split('?>')[1]}`;
  await assert.rejects(service.parseLibrary(malicious), { status: 422 });
});

test('Dublin Core export contains the title and type', () => {
  const xml = service.buildDublinCore({ _id: '1', title: 'Test', year: 2025, kind: 'report', keywords: ['a'], language: 'fr' });
  assert.match(xml, /<dc:title>Test<\/dc:title>/);
  assert.match(xml, /Text\.Thesis/);
});
