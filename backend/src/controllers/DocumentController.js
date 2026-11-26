/** HTTP adapter for the library (catalogue, ingestion, XML exchange). */
export class DocumentController {
  /** @param {import('../services/DocumentService.js').DocumentService} documentService */
  constructor(documentService) {
    this.documentService = documentService;
  }

  list = async (req, res) => res.json(await this.documentService.search(req.validated.query));

  facets = async (_req, res) => res.json(await this.documentService.getFacets());

  getOne = async (req, res) => res.json(await this.documentService.getById(req.params.id));

  upload = async (req, res) => {
    const result = await this.documentService.ingestPdf(req.file, req.validated.body, req.user.id);
    res.status(201).json(result);
  };

  update = async (req, res) => res.json(await this.documentService.update(req.params.id, req.validated.body));

  remove = async (req, res) => {
    await this.documentService.remove(req.params.id);
    res.sendStatus(204);
  };

  download = async (req, res) => {
    res.sendFile(await this.documentService.getFilePath(req.params.id, req.user));
  };

  importXml = async (req, res) => {
    res.status(201).json(await this.documentService.importXml(req.body, req.user.id));
  };

  exportLibraryXml = async (_req, res) => {
    res.type('application/xml').send(await this.documentService.exportLibraryXml());
  };

  exportDublinCore = async (req, res) => {
    res.type('application/xml').send(await this.documentService.exportDublinCore(req.params.id));
  };
}
