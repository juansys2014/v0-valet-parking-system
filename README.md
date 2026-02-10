# Valet Parking — Monorepo

## Requisitos

- Node.js 20+
- MySQL o MariaDB
- Un solo `package-lock.json` en root (npm workspaces)

## Setup y desarrollo

```bash
npm install
```

Crear `backend/.env` con `DATABASE_URL` (y opcionalmente `PORT=4000`).  
Opcional: `frontend/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:4000` (por defecto usa ese valor).

```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000
- **Health:** http://localhost:4000/health

## Comandos (desde root)

| Comando                | Descripción                     |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Backend + frontend en paralelo  |
| `npm run dev:backend`  | Solo backend                    |
| `npm run dev:frontend` | Solo frontend                   |
| `npm run build`        | Build backend y frontend        |
| `npm run start`        | Producción (backend + frontend) |

## Prisma (desde root o desde `backend/`)

```bash
npm run prisma:generate --workspace=backend

no ejecutar:
npm run prisma:migrate --workspace=backend -- --name <nombre>
npm run prisma:studio --workspace=backend

ejecutar para que funcione en prod:
npm run prisma:deploy --workspace=backend
```

O desde `backend/`:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
```

## Producción con PM2 (Mac o Linux)

Mismo `ecosystem.config.cjs` en local y en servidor Linux.

```bash
npm run build
npm run prisma:deploy --workspace=backend   # si aplica
pm2 start ecosystem.config.cjs
```

Útiles: `pm2 status`, `pm2 logs`, `pm2 stop all`, `pm2 restart all`.

## Estructura

- `frontend/` — Next.js (UI, puerto 3000). API client en `lib/client/api.ts`.
- `backend/` — Express + Prisma 7 + MariaDB (puerto 4000). Detalle en `backend/README_BACKEND.md`.
