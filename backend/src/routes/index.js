/**
 * Composition root: instantiates repositories, services and controllers
 * (manual dependency injection) and wires them to Express routers.
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import express from 'express';

import { UserRepository } from '../repository/UserRepository.js';
import { DocumentRepository } from '../repository/DocumentRepository.js';
import { ChunkRepository } from '../repository/ChunkRepository.js';
import { AuthService } from '../services/AuthService.js';
import { ChunkingService } from '../services/ChunkingService.js';
import { EmbeddingService } from '../services/EmbeddingService.js';
import { XmlService } from '../services/XmlService.js';
import { DocumentService } from '../services/DocumentService.js';
import { RagService } from '../services/RagService.js';
import { AuthController } from '../controllers/AuthController.js';
import { DocumentController } from '../controllers/DocumentController.js';
import { AssistantController } from '../controllers/AssistantController.js';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { uploadPdf } from '../middlewares/upload.js';
import { asyncHandler as wrap } from '../utils/asyncHandler.js';
import * as schemas from '../validators/schemas.js';
import { USER_ROLES } from '../models/User.js';

export const userRepository = new UserRepository();
export const documentRepository = new DocumentRepository();
const chunkRepository = new ChunkRepository();
const embeddingService = new EmbeddingService();

const authService = new AuthService(userRepository);
export const documentService = new DocumentService(
  documentRepository, chunkRepository, new ChunkingService(), embeddingService, new XmlService(),
);
const ragService = new RagService(chunkRepository, documentRepository, embeddingService);

const authController = new AuthController(authService);
const documentController = new DocumentController(documentService);
const assistantController = new AssistantController(ragService);

const admin = [authenticate, authorize(USER_ROLES.ADMIN)];

const authRouter = Router();
authRouter.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true }));
authRouter.post('/register', validate(schemas.registerSchema), wrap(authController.register));
authRouter.post('/login', validate(schemas.loginSchema), wrap(authController.login));
authRouter.post('/refresh', wrap(authController.refresh));
authRouter.post('/logout', authController.logout);

const documentRouter = Router();
documentRouter.use(authenticate);
documentRouter.get('/', validate(schemas.documentQuerySchema, 'query'), wrap(documentController.list));
documentRouter.get('/facets', wrap(documentController.facets));
// Static segments are declared before '/:id' so they are not captured as an id.
documentRouter.get('/export/xml', admin[1], wrap(documentController.exportLibraryXml));
documentRouter.post('/import/xml', admin[1], express.text({ type: ['application/xml', 'text/xml'], limit: '5mb' }), wrap(documentController.importXml));
documentRouter.post('/upload', admin[1], uploadPdf, validate(schemas.documentMetadataSchema), wrap(documentController.upload));
documentRouter.get('/:id', wrap(documentController.getOne));
documentRouter.get('/:id/file', wrap(documentController.download));
documentRouter.get('/:id/export/xml', wrap(documentController.exportDublinCore));
documentRouter.put('/:id', admin[1], validate(schemas.documentUpdateSchema), wrap(documentController.update));
documentRouter.delete('/:id', admin[1], wrap(documentController.remove));

const assistantRouter = Router();
assistantRouter.post(
  '/ask',
  authenticate,
  rateLimit({ windowMs: 60 * 1000, max: 15, keyGenerator: (req) => req.user.id }),
  validate(schemas.askSchema),
  wrap(assistantController.ask),
);

export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
apiRouter.use('/auth', authRouter);
apiRouter.use('/documents', documentRouter);
apiRouter.use('/assistant', assistantRouter);
