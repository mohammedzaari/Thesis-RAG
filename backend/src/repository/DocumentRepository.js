import { LibraryDocument } from '../models/LibraryDocument.js';

/** Data-access layer for library documents (reports and guides). */
export class DocumentRepository {
  findById(id) {
    return LibraryDocument.findById(id);
  }

  /**
   * Paginated search with optional full-text relevance sorting.
   * @param {object} filter MongoDB filter
   * @param {{page:number, limit:number, byRelevance:boolean}} options
   */
  async search(filter, { page, limit, byRelevance }) {
    const projection = byRelevance ? { score: { $meta: 'textScore' } } : {};
    const sort = byRelevance ? { score: { $meta: 'textScore' } } : { year: -1, title: 1 };
    const [items, total] = await Promise.all([
      LibraryDocument.find(filter, projection)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      LibraryDocument.countDocuments(filter),
    ]);
    return { items, total };
  }

  /** Distinct values used to build the search facets. */
  async getFacets(filter) {
    const [years, companies, technologies] = await Promise.all([
      LibraryDocument.distinct('year', filter),
      LibraryDocument.distinct('companyName', filter),
      LibraryDocument.distinct('technologies', filter),
    ]);
    return {
      years: years.filter(Boolean).sort((a, b) => b - a),
      companies: companies.filter(Boolean).sort(),
      technologies: technologies.filter(Boolean).sort(),
    };
  }

  /** Creates or updates a document identified by its XML `externalId`. */
  upsertByExternalId(externalId, data) {
    return LibraryDocument.findOneAndUpdate({ externalId }, { $set: data }, { new: true, upsert: true });
  }

  create(data) {
    return LibraryDocument.create(data);
  }

  updateById(id, data) {
    return LibraryDocument.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  }

  deleteById(id) {
    return LibraryDocument.findByIdAndDelete(id);
  }

  count() {
    return LibraryDocument.countDocuments();
  }

  findAll(filter = {}) {
    return LibraryDocument.find(filter).sort({ year: -1, title: 1 }).lean();
  }
}
