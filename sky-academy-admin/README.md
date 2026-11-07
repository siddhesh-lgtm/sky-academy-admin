# SKY Academy Admin

React 19 + Vite + TypeScript admin frontend.

## Start

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. Keep this process running — Vite hot-reloads on save.

## Demo logins
| Role | Email | Password |
|------|-------|----------|
| SKY Super Admin | `superadmin@skyacademy.demo` | `super123` |
| Center Admin | `vikram@skyacademy.demo` | `center123` |
| Finance / Accounts | `finance@skyacademy.demo` | `finance123` |

Quick-login buttons are on the sign-in screen.

## Live API mode

Copy `.env.example` to `.env`, set:

```
VITE_API_MODE=live
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Backend lives in `../backend`.
