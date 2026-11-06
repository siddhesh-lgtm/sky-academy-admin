# SKY Academy Admin Studio V4

React 19 + Vite + TypeScript admin frontend with a page-based editor experience and Light / Dark / Auto appearance setting.

## Web login roles (preview only)
- SKY Super Admin
- Center Admin
- Finance / Accounts

Coach, Head Coach and Parent do **not** sign in to the Admin Web frontend. Their records can be managed from authorized administrative modules, but their own user experiences belong to separate applications. Players aged 8–12 never log in and are not assigned to a home center; their Passport allows eligible sessions at multiple centers.

## Start frontend

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. Add Center, Create Passport, New Session, Create Web User, Assign Staff, Edit CMS and Edit Policy launch dedicated full-page routes such as `/admin/centers/new`. Browser Back works. No modal forms are used. The theme switcher supports Light, Dark and Auto (system preference), saved in the browser.

## Optional Node.js + MySQL starter API

The included backend starter implements **create/list Center, Passport and Session only**. It is for local development and does **not** include authentication, RBAC or all SKY Academy modules. It must not be exposed publicly.

1. Run `backend/sql/001_core_starter.sql` in MySQL.
2. In `backend/`, copy `.env.example` to `.env`, fill local DB settings, then run `npm install && npm run dev`.
3. In frontend root, copy `.env.example` to `.env`, set `VITE_API_MODE=live`, restart Vite.

Other screens remain illustrative sample-data views and their write actions require authenticated backend implementation. Do not use the demo role switcher as real authorization.

## API surfaces
- `/api/v1/admin/*` – web admin
- `/api/v1/app/parent/*` – planned Parent App
- `/api/v1/app/coach/*` – planned Coach App
- `/api/v1/public/*` – planned public landing site

Use central domain modules but distinct API controllers with server-side RBAC, multi-center Passport eligibility, atomic booking capacity/credits, and audit logging before production.

## Validation note
Source was syntax-checked using the TypeScript compiler transpiler. A full `npm install` / production build was not possible in this environment because the package registry could not be reached.
