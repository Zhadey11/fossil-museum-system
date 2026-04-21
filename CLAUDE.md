# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

**StoneWake Museum** — Fossil cataloguing system for a research centre. Final project for Bases de Datos, UNADECA, delivery April 2026.

### What each role can see

| Section | Público | Investigador | Admin |
|---------|---------|-------------|-------|
| Nombre, descripción, imagen, categoría, era, ubicación, fecha, encontrado por, galería | ✓ | ✓ | ✓ |
| Código único, coordenadas GPS | ✗ | ✓ | ✓ |
| Taxonomía completa (7 niveles), contexto geológico, medidas, estado del espécimen | ✗ | ✓ | ✓ |
| Estado (Publicado/Pendiente/Rechazado), controles edición/eliminación | ✗ | ✗ | ✓ |

**GPS coordinates are never exposed to the public.** Scientific data (taxonomy, geology, measures) is investigador+admin only — enforce at the API layer, not only in the UI.

### Business rules
- All data flows: BD → API → Frontend. Never hardcode data in the frontend.
- Soft delete is mandatory everywhere; no physical deletes.
- Images must use lazy loading. List endpoints must paginate with LIMIT/OFFSET.

### Known pending issues (as of April 2026)
- Custom golden cursor (`CustomCursor.tsx`) — already deleted, confirm it's fully removed
- Catalog cards: must be 4 columns (currently 3)
- Dashboard stat cards: must be 1 row (currently 2×2 grid)
- ISO dates need formatting → display as "15 mar 2021"
- Map pins must be golden
- Period filter from `/tiempo-profundo` not working
- Scientific section and taxonomy still visible to public → must be hidden
- Debug text visible in UI → remove
- Fossil data incomplete in DB (seed data needs enrichment — run scripts 103 and 104)

## Commands

### Development
```bash
# Run both backend and frontend concurrently (from repo root)
npm run dev:all

# Backend only (port 4000)
npm run dev:backend

# Frontend only (port 3000, Turbopack)
npm run dev
```

### Build & Lint
```bash
npm run build        # Next.js production build
npm run lint         # ESLint (frontend only)
```

### Database setup (SQL Server — run in order)
```
01_base_datos.sql             → DB + reference tables (geography, eras, taxonomy)
02_tablas_principales.sql     → Core tables (FOSIL, MULTIMEDIA, USUARIO, CONTACTO)
03_fulltext_fosiles.sql       → Full-Text catalog (must precede 04)
04_indices_vistas_sp.sql      → Indexes, views, stored procedures
05_datos_prueba.sql           → Seed mínimo: usuarios base + catálogo geográfico/taxonomía (sin fósiles)
07_catalogo_43_desde_imagenes.sql → Carga base de fósiles desde inventario de imágenes
08_enriquecimiento_41_fichas.sql  → Enriquecimiento de fichas para vistas pública e investigador
06_solicitud_y_suscriptores.sql → Research requests + newsletters
```
Use `node backend/scripts/run-sql-file.js <file>` or run directly in SSMS.

### Media management
```bash
npm run sync:fossil-images      # Scan disk → create MULTIMEDIA records in DB
npm run verify:media            # Audit DB ↔ disk consistency
cd backend && npm run apply:media-rules        # Rewrite MULTIMEDIA.url by subfolder category
cd backend && npm run apply:media-rules:dry    # Dry-run preview
```

### Utilities
```bash
cd backend && node scripts/gen-hash.js "MyPassword"   # Generate bcrypt hash for seed data
cd backend && node scripts/test-db-connection.js      # Verify SQL Server connectivity
npm run verify:contracts                              # Validate API response contracts
```

## Architecture

### Monorepo layout
```
/backend    Express 5 API (CommonJS, port 4000)
/frontend   Next.js 15 App Router (TypeScript, port 3000)
/database   SQL Server DDL + seed scripts
```

### Backend structure
Each feature is a module under `backend/src/modules/<name>/` with three files: `*.routes.js`, `*.controller.js`, `*.service.js`. Modules: `auth`, `fosiles`, `multimedia`, `admin`, `investigacion`, `estudios`, `usuarios`, `catalogos`, `taxonomia`, `geologia`, `ubicacion`, `contacto`, `suscriptores`.

Key infrastructure files:
- [`backend/src/config/db.js`](backend/src/config/db.js) — SQL Server connection pool; switches between Windows Auth (`mssql/msnodesqlv8`) and SQL Auth (`mssql`) via `DB_USE_WINDOWS_AUTH`
- [`backend/src/config/paths.js`](backend/src/config/paths.js) — Resolves `IMAGES_DIR`, `VIDEOS_DIR`, `UPLOADS_DIR` relative to the `backend/` package root (not `process.cwd()`)
- [`backend/src/middlewares/auth.js`](backend/src/middlewares/auth.js) — JWT verification; reads token from `Authorization: Bearer` header or `fossiles_token` cookie, then checks revocation store + DB activo/deleted_at
- [`backend/src/middlewares/roles.js`](backend/src/middlewares/roles.js) — `checkRole([1, 3])` usage; roles array comes from `req.user.roles[]`
- [`backend/src/security/tokenStore.js`](backend/src/security/tokenStore.js) — In-memory Set + file persistence at `backend/.runtime/revoked_tokens.json`
- [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml) — OpenAPI 3.0 spec; served at `/api/docs`

### Frontend structure
Uses Next.js App Router. All API calls go through [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts), which exports typed fetch wrappers. The internal `apiFetch()` helper attaches `credentials: "include"` on every call.

URL routing in `api.ts`: client-side calls use `/__api/<path>` (Next.js rewrite proxy); SSR calls hit the backend directly via `INTERNAL_API_URL` or `NEXT_PUBLIC_API_URL`. Media assets (`/images/`, `/videos/`, `/uploads/`) go through `/__api-media/` to avoid CORS issues when accessed by LAN IP.

Auth state is stored in localStorage under the key from `frontend/src/lib/auth.ts`. There is no server-side session; the JWT cookie (`fossiles_token`, httpOnly) handles authenticated SSR.

### Database conventions
- All core tables have `deleted_at DATETIME2 NULL` — deletion is always a soft delete; restore via admin `/papelera` endpoints.
- `LOG_AUDITORIA` captures INSERT/UPDATE/DELETE with JSON diffs. The trigger on `FOSIL` auto-logs scientific field changes.
- Fossil status workflow: `pendiente → en_revision → publicado | rechazado`
- Fossil `codigo_unico` format: `[A-Z]{3}-[A-Z]{3}-[A-Z]{3}-[A-Z]{3}-[0-9]{5}`

### Roles
| ID | Name | Access |
|----|------|--------|
| 1 | Admin | Full — approve/reject fossils, manage users, trash |
| 2 | Investigador | Scientific detail view (requires approved SOLICITUD_INVESTIGACION) |
| 3 | Explorador | Submit own fossils, upload multimedia |

### Media files on disk
Images live under `backend/images/fossiles/` in subfolders: `paleontologico-especifico`, `generales`, `mineralizados`, `minerales`, `rocas`, `excavaciones`. After seeding or adding new files, run `apply:media-rules` to sync `MULTIMEDIA.url` values to match the current disk paths.

## Environment variables

**Backend (`backend/.env`):**
```
PORT=4000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<long secret>
DB_USE_WINDOWS_AUTH=true
DB_SERVER=.
DB_DATABASE=FosilesDB
# If DB_USE_WINDOWS_AUTH=false:
DB_USER=sa
DB_PASSWORD=...
```

**Frontend (optional `frontend/.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
INTERNAL_API_URL=http://127.0.0.1:4000
NEXT_ALLOWED_DEV_ORIGINS=192.168.x.x:3000   # for mobile LAN testing
```
