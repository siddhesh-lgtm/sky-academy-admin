# SKY Academy — Current Project Context

**This file is the source of truth for product scope in this repo.**  
Legacy design PDFs in `docs/legacy/` are historical. Where they conflict with this document or with decisions from implementation chats, **this document wins**.

Last aligned: Nov 2026 (admin FE consolidation + role scope freeze).

---

## What SKY Academy is (kept from legacy)

- Junior cricket academy ecosystem for children **aged 8–12**.
- Core journey intent: **Discover → Book → Train → Assess → Improve**.
- Persistent child record via **SKY Player Passport** (credits / eligibility, not a fixed home-center ownership model for players).
- Multi-center: Passports can allow booking at **eligible centers**; players are not permanently assigned to one home center.
- Brand: cricket-first, approachable admin/ops tooling for academy teams.

## What changed / is out of current build scope

Legacy docs describe a full multi-app product (Parent App, Coach App, personal at-home / online / private-nets coaching marketplace, scouting, live parent video, scholarships, etc.).

**Current repo focus is narrower:**

| In scope now | Not building now (legacy / later) |
|---|---|
| Admin **web** frontend (`sky-academy-admin/`) | Parent mobile app screens |
| Optional Node/MySQL starter API (`backend/`) | Coach mobile app |
| Centers, Passports, Sessions, Bookings (admin) | Personal coach marketplace (home / online / private ground) |
| Staff assignment (Head Coach / Coach / Center Admin) | Platform “Centre Ops” as a separate login role |
| Finance overview in admin | Full payment gateway / settlements product |
| Demo auth + mock data (FE-first) | OTP guardian auth, safeguarding incident queues as product |

Treat legacy slides as **design direction**, not as the role matrix or MVP backlog for this codebase.

---

## Repo layout

```
sky academy/
  docs/                  ← product context (this folder)
  docs/legacy/           ← old PDFs (do not override current roles from these)
  sky-academy-admin/     ← React 19 + Vite admin FE (canonical frontend)
  backend/               ← Express + MySQL starter (partial APIs, no real auth)
  .cursor/rules/         ← agent rules derived from this context
```

Run FE from `sky-academy-admin/` only (`npm run dev` → http://localhost:5173).

---

## Surfaces (API intent)

| Surface | Status |
|---|---|
| `/api/v1/admin/*` | Starter implemented (list + create for centers/passports/sessions; many GETs) |
| `/api/v1/app/parent/*` | Planned — not in this admin FE |
| `/api/v1/app/coach/*` | Planned — not in this admin FE |
| `/api/v1/public/*` | Planned — CMS preview only in admin |

Backend has **no authentication / RBAC**. Frontend role checks are **display-only**.

---

## Roles — current truth

### A) Web Admin login (sign into this FE)

Only these three accounts sign into the Admin Web panel:

1. **SKY Super Admin**
2. **Center Admin**
3. **Finance / Accounts**

Demo credentials live in `sky-academy-admin/src/data.ts` and on the login quick-login buttons.

### B) Staff (managed in Admin → Staff; do **not** web-login here)

4. **Head Coach**
5. **Coach**  
   (Center Admin also appears as staff assignment when scoped to a center.)

### C) Members (other apps / records only)

6. **Parent / Guardian** — Parent App later; visible as linked guardians in admin lists  
7. **Player / Student (8–12)** — never logs into Admin Web; Passport-based booking across eligible centers  

### Explicitly dropped vs legacy docs

Do **not** invent separate web-login roles for:

- Centre Ops (folded into Center Admin / ops screens)
- Academy Admin (folded into SKY Super Admin / Center Admin)
- Platform Super Admin as a fourth login name (use **SKY Super Admin**)
- Player or Parent as Admin Web users

---

## Admin module access (FE)

From `sky-academy-admin/src/data.ts` `permissions`:

| Module | Super Admin | Center Admin | Finance |
|---|---|---|---|
| Dashboard | ✓ | ✓ (center-scoped) | ✓ |
| Centers | ✓ | ✓ (own center) | |
| Users & Roles | ✓ | | |
| Staff & Coaches | ✓ | ✓ | |
| Parents & Players | ✓ | ✓ | |
| Passports | ✓ | ✓ | ✓ |
| Sessions | ✓ | ✓ | |
| Bookings | ✓ | ✓ | |
| Assessments | ✓ | ✓ | |
| Payments | ✓ | | ✓ |
| Reports | ✓ | ✓ | ✓ |
| CMS / Features / Settings | ✓ | | |

---

## Domain rules (current product)

- Sport focus in this build: **Cricket**.
- Passports: duration + included session credits + center access rules (all eligible / selected centers / city).
- Sessions: capacity, coach assignment, center, booking fill.
- Bookings: Confirmed / Attended / Cancelled; attendance can be marked in demo.
- Maker-checker for center applications: Super Admin UI only (demo).
- Detail pages + FE CRUD exist for Centers, Web Users, Staff (local/mock; not full backend).

---

## Auth note

Login is **demo-only** (localStorage). Creating web users stores extra accounts in localStorage. Never treat FE role switching / demo passwords as production security.
