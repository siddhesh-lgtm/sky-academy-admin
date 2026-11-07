# SKY Academy

Monorepo layout:

- `sky-academy-admin/` — Admin web frontend (React 19 + Vite + TypeScript)
- `backend/` — Optional Node.js + MySQL starter API
- `docs/` — **Current product context** (`PROJECT_CONTEXT.md`, `ROLES.md`)
- `docs/legacy/` — Old design PDFs (historical only; do not override current roles)

Canonical scope and roles: see [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md). Legacy PDFs are outdated where they conflict.

## Start frontend

```sh
cd sky-academy-admin
npm install
npm run dev
```

Open `http://localhost:5173`.

Demo web login roles: SKY Super Admin, Center Admin, Finance / Accounts.

## Start backend (optional)

```sh
cd backend
cp .env.example .env   # fill local DB settings
npm install
npm run dev
```

Then in `sky-academy-admin/`, set `VITE_API_MODE=live` in `.env` and restart Vite.

## API surfaces
- `/api/v1/admin/*` – web admin
- `/api/v1/app/parent/*` – planned Parent App
- `/api/v1/app/coach/*` – planned Coach App
- `/api/v1/public/*` – planned public landing site
