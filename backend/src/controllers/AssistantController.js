/** HTTP adapter for the RAG assistant. */
export class AssistantController {
  /** @param {import('../services/RagService.js').RagService} ragService */
  constructor(ragService) {
    this.ragService = ragService;
  }

  ask = async (req, res) => res.json(await this.ragService.ask(req.validated.body, req.user));
}
