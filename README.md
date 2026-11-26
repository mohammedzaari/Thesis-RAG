# Thesis Library & Writing Assistant (RAG)

Helps master's students write their thesis / internship report (organisation chapter, architecture choices)
by searching past reports and guides, and by asking an assistant that answers **only from the library, with sources**.

| Layer | Technology |
|---|---|
| Front-end | Angular 18 (standalone components, signals, reactive forms, lazy routes) |
| API | Node.js 20 + Express (layers: routes → controllers → services → repository → models) |
| Storage | MongoDB (JSON documents + text chunks + optional embeddings) |
| XML | `library.xsd` contract: bulk import, catalogue export, Dublin Core records |
| Security | JWT access (15 min, in memory) + refresh (httpOnly cookie), bcrypt, zod, helmet, rate limiting, RBAC |
| Deployment | Docker Compose (mongo, api, web/nginx) |

## Run with Docker
```bash
cp .env.example .env      # set the secrets (openssl rand -hex 32)
docker compose up --build -d
# http://localhost   — sign in with ADMIN_EMAIL / ADMIN_PASSWORD
```
At first start the API creates the admin account and imports 4 starter guides from `backend/resources/seed/library.xml`.

## Run locally
```bash
cd backend  && cp .env.example .env && npm install && npm run dev     # needs a MongoDB on MONGO_URI
cd frontend && npm install && npm start                               # http://localhost:4200 (proxy to :3000)
cd backend  && npm test
```

## RAG pipeline
1. **Ingestion**: PDF (or XML `<content>`) → text → paragraph-aware chunks (≈1000 chars, 150 overlap) → MongoDB `chunks`.
2. **Retrieval**: with `VOYAGE_API_KEY`, chunks are embedded and ranked by cosine similarity (semantic);
   without it, MongoDB full-text search (`$text`) is used. The visibility filter is applied *inside* the query.
3. **Generation**: with `ANTHROPIC_API_KEY`, Claude answers strictly from the numbered excerpts and cites `[n]`;
   without it the API returns the best passages (extractive mode).

## Main endpoints
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` `/login` `/refresh` `/logout` | public |
| GET | `/api/documents?q=&kind=&year=&company=&technology=&page=` | authenticated |
| GET | `/api/documents/facets`, `/:id`, `/:id/file`, `/:id/export/xml` | authenticated |
| POST | `/api/documents/upload` (multipart PDF + metadata) | admin |
| POST | `/api/documents/import/xml` (`application/xml`) | admin |
| GET | `/api/documents/export/xml` | admin |
| POST | `/api/assistant/ask` `{question, history}` | authenticated |

## Known limits / next steps
- Metadata are entered by the admin at upload (no AI metadata extraction yet).
- Scanned PDFs need OCR (rejected with a clear message today).
- For very large corpora, move similarity search to Atlas Vector Search instead of in-process cosine.
- Reports may contain confidential company data: use the `restricted` visibility and check consent / data-protection rules.
