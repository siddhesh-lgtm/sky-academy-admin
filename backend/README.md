# SKY Academy Admin API

## Start MySQL (WAMP)
If service is stopped, start mysqld manually or via WAMP.

## Reset DB + seed
```sh
cd backend
npm run db:reset
```

## Run API
```sh
cd backend
npm install
npm run dev
```

API: http://127.0.0.1:4000/api/v1/health

## Frontend live mode
Root `.env`:
```
VITE_API_MODE=live
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Then `npm run dev` in project root.

## Working admin flow
1. Open admin UI
2. Centers / Passports / Sessions list from MySQL
3. Add Center / Create Passport / New Session → POST to API → saved in DB
4. Bookings & feature flags also load from API
