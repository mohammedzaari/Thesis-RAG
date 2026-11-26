# Front-end architecture (Angular 18)

## Folder layout
```
src/app/
├── app.component.ts / app.config.ts / app.routes.ts     application shell
├── core/                  singletons, loaded once, never imported by shared/
│   ├── auth/              AuthService, authGuard/adminGuard, authInterceptor, auth.model
│   ├── api/               HTTP clients (one service per back-end resource)
│   ├── config/            api-endpoints.ts (all URLs in one place)
│   └── layout/header/     header + navigation
├── shared/                reusable, feature-agnostic building blocks
│   ├── models/            API contracts (document.model, assistant.model)
│   ├── components/        presentational components (form-error)
│   └── utils/             pure functions (file-download.util)
└── features/              one folder per business capability, lazy-loaded
    ├── auth/              auth.routes.ts, login/
    ├── library/           library.routes.ts, pages/, components/
    ├── assistant/         assistant.routes.ts, pages/, components/
    └── admin/             admin.routes.ts, pages/, components/
```

## Dependency rules
`features → core, shared` · `core → shared` · `shared → (nothing)` · **a feature never imports another feature.**
Imports across layers use path aliases (`@core/*`, `@shared/*`, `@features/*`), never `../../..`.

## Smart / presentational split
- **pages/** (container components): own state (signals), call `core/api` services, compose components.
- **components/** (presentational): data in with `input()`, intent out with `output()`, no HTTP, `OnPush`.

## Conventions (Angular style guide)
| Item | Rule | Example |
|---|---|---|
| File names | kebab-case + type suffix | `document-card.component.ts`, `auth.guard.ts` |
| Classes | PascalCase + suffix | `DocumentCardComponent`, `AuthService` |
| Selectors | `app-` prefix, kebab-case | `app-search-filters` |
| Component files | `.ts` + `.html` + `.css` side by side (inline only for trivial templates) | |
| Routes | `<feature>.routes.ts` exporting `FEATURE_ROUTES`, loaded with `loadChildren` | `LIBRARY_ROUTES` |
| State | `signal()` / `computed()`; `ChangeDetectionStrategy.OnPush` everywhere | |
| Forms | typed reactive forms (`nonNullable`), messages through `app-form-error` | |
| HTTP | only in `core/api`, URLs only from `API_ENDPOINTS` | |
| Security | access token in memory only, refresh token in httpOnly cookie | |

## Adding a feature
1. Create `features/<name>/` with `<name>.routes.ts`, `pages/`, `components/`.
2. Add the HTTP calls in `core/api/<resource>-api.service.ts` and the URLs in `API_ENDPOINTS`.
3. Register a lazy route in `app.routes.ts`.
