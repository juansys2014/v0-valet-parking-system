# Backend Valet Parking (Express + Prisma 7 + MariaDB)

API REST para el sistema de valet parking.

## Requisitos

- Node.js 20+
- MySQL o MariaDB
- Variables en `backend/.env`: `DATABASE_URL`, `PORT` (opcional, default 4000)

## Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init   # si es primera vez
# o
npx prisma migrate deploy            # aplicar migraciones existentes
```

## Desarrollo

```bash
npm run dev
```

Servidor en `http://localhost:4000`. CORS habilitado para `http://localhost:3000` (frontend).

## Build y producción

```bash
npm run build
npm start
```

## Probar con curl

Base URL: `http://localhost:4000`.

### Health

```bash
curl http://localhost:4000/health
```

### POST /api/entry

```bash
curl -X POST http://localhost:4000/api/entry \
  -H "Content-Type: application/json" \
  -d "{\"ticketCode\":\"T001\",\"licensePlate\":\"ABC123\",\"parkingSpot\":\"A1\",\"attendantName\":\"Juan\",\"notes\":\"Auto negro\"}"
```

### GET /api/active

```bash
curl "http://localhost:4000/api/active"
curl "http://localhost:4000/api/active?search=ABC"
```

### GET /api/history

```bash
curl "http://localhost:4000/api/history"
curl "http://localhost:4000/api/history?search=T001"
```

### POST /api/checkout/request

```bash
curl -X POST http://localhost:4000/api/checkout/request \
  -H "Content-Type: application/json" \
  -d "{\"ticketId\":\"<UUID>\"}"
```

### POST /api/checkout/quick-exit

```bash
curl -X POST http://localhost:4000/api/checkout/quick-exit \
  -H "Content-Type: application/json" \
  -d "{\"ticketCode\":\"RAPIDO01\",\"licensePlate\":\"DEF456\"}"
```

### POST /api/tickets/:id/ready

```bash
curl -X POST http://localhost:4000/api/tickets/<UUID>/ready \
  -H "Content-Type: application/json" \
  -d "{\"attendantName\":\"Maria\"}"
```

### POST /api/tickets/:id/delivered

```bash
curl -X POST http://localhost:4000/api/tickets/<UUID>/delivered \
  -H "Content-Type: application/json" \
  -d "{\"attendantName\":\"Maria\"}"
```

### GET /api/alerts

```bash
curl "http://localhost:4000/api/alerts"
```

## Respuestas

- Éxito: `{ "ok": true, ... }`, 200.
- Validación (Zod): 400, `{ "ok": false, "error": "Validation error", "details": { ... } }`.
- No encontrado: 404, `{ "ok": false, "error": "..." }`.

## Estructura

- `src/server.ts` — Entrada Express, CORS, rutas.
- `src/db/prisma.ts` — PrismaClient con adapter MariaDB.
- `src/api/response.ts` — Helpers JSON y errores 400.
- `src/validators/*.ts` — Schemas Zod.
- `src/repositories/*.ts` — Acceso a DB.
- `src/services/*.ts` — Lógica de negocio.
- `src/routes/*.ts` — Rutas Express.
- `prisma/schema.prisma` — Modelos y migraciones.
- `prisma.config.ts` — Config Prisma 7 (URL, migrations path).
