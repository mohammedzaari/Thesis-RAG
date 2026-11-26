import fs from 'node:fs';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { validateXML } from 'xmllint-wasm';
import { HttpError } from '../utils/HttpError.js';

const SCHEMA_PATH = new URL('../../resources/schemas/library.xsd', import.meta.url);

/** XML boundary: XSD validation, XML -> domain objects, domain objects -> XML. */
export class XmlService {
  constructor() {
    this.schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: false, // keep text as-is, numbers are coerced by zod later
      isArray: (name) => ['document', 'keyword', 'technology'].includes(name),
    });
    this.builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });
  }

  /**
   * Validates a library XML against the XSD, then converts it to plain objects.
   * @param {string} xml
   * @returns {Promise<Array<{metadata: object, content: string}>>}
   */
  async parseLibrary(xml) {
    // XXE / entity-expansion defence: DTDs are never needed for this contract.
    if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
      throw new HttpError(422, 'DTD declarations are not allowed');
    }
    const result = await validateXML({
      xml: [{ fileName: 'library.xml', contents: xml }],
      schema: [{ fileName: 'library.xsd', contents: this.schema }],
    });
    if (!result.valid) {
      throw new HttpError(422, 'XML does not comply with library.xsd', result.errors.map((e) => e.message));
    }

    const { library } = this.parser.parse(xml);
    return library.document.map((node) => ({
      metadata: {
        externalId: node['@_id'],
        kind: node['@_kind'],
        year: Number(node['@_year']),
        language: node['@_language'] ?? 'fr',
        visibility: node['@_visibility'] ?? 'public',
        title: node.title,
        abstract: node.abstract ?? '',
        authorName: node.author ?? '',
        supervisorName: node.supervisor ?? '',
        program: node.program ?? '',
        companyName: node.company ?? '',
        city: node.city ?? '',
        keywords: node.keywords?.keyword ?? [],
        technologies: node.technologies?.technology ?? [],
      },
      content: node.content ?? '',
    }));
  }

  /** Serialises documents (without full text) to the library XML format. */
  buildLibrary(documents) {
    const nodes = documents.map((doc) => ({
      '@_id': doc.externalId ?? String(doc._id),
      '@_kind': doc.kind,
      '@_year': doc.year,
      '@_language': doc.language,
      '@_visibility': doc.visibility,
      title: doc.title,
      abstract: doc.abstract,
      author: doc.authorName,
      supervisor: doc.supervisorName,
      program: doc.program,
      company: doc.companyName,
      city: doc.city,
      keywords: { keyword: doc.keywords },
      technologies: { technology: doc.technologies },
    }));
    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build({ library: { document: nodes } })}`;
  }

  /** Dublin Core record (OAI-DC) for bibliographic interoperability. */
  buildDublinCore(doc) {
    const record = {
      'oai_dc:dc': {
        '@_xmlns:oai_dc': 'http://www.openarchives.org/OAI/2.0/oai_dc/',
        '@_xmlns:dc': 'http://purl.org/dc/elements/1.1/',
        'dc:title': doc.title,
        'dc:creator': doc.authorName || undefined,
        'dc:contributor': doc.supervisorName || undefined,
        'dc:date': doc.year,
        'dc:description': doc.abstract || undefined,
        'dc:subject': doc.keywords,
        'dc:language': doc.language,
        'dc:publisher': doc.companyName || undefined,
        'dc:type': doc.kind === 'report' ? 'Text.Thesis' : 'Text.Guide',
        'dc:identifier': doc.externalId ?? String(doc._id),
      },
    };
    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(record)}`;
  }
}
