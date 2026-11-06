# SKY Academy — Admin Studio V3

React + Vite + TypeScript frontend prototype with a navy sidebar, bright main workspace, larger text, improved dashboard hero, responsive layout, and 14 admin modules.

## Web portal access

There are **exactly 3 web login roles**:
- SKY Super Admin — platform-wide operations.
- Center Admin — assigned center operations.
- Finance / Accounts — platform-wide authorized finance operations.

The **Web Admin Access / user directory** intentionally lists only these 3 types of accounts. The **Staff & Coaches** management page still lists Head Coaches and Coaches as managed staff records; they do **not** receive web-admin login access. Parents and Guardians are managed in **Parents & Players**, not the web directory. Parent and Coach sign in to their own separate apps. Children aged 8–12 never sign in and are not affiliated with one permanent center.

The top-right role selector is a **UI-only demonstration**, not production authentication or access control.

## Launch

```bash
npm install
npm run dev
```

Open http://localhost:5173. To create a production build:

```bash
npm run build
```

> Dependencies were not installable in the generation environment due to DNS/network restrictions. Source syntax was validated with TypeScript's transpiler, but the actual browser build was not run here.

## Technology

- React 19, Vite, TypeScript
- Lucide React icons
- Recharts charts
- Node.js REST API integration boundary (`src/api.ts`)
- Planned MySQL data persistence via the Node.js backend (not implemented in this ZIP)

## API namespaces

- `/api/v1/admin/*` — admin web
- `/api/v1/app/parent/*` — parent app
- `/api/v1/app/coach/*` — coach app
- `/api/v1/public/*` — landing website

The source is a **frontend demo** with local, seeded data, in-memory interactive actions, and role-dependent navigation. Persistence, authentication, server-side RBAC, feature flags, consent verification, and transactional Passport booking need Node.js/MySQL implementation. Do not deploy the demo role selector as a production login.
