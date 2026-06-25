# Lumière Survey — Backend

API server for the Lumière skincare survey. Built with **Fastify**, **Prisma** (SQLite/PostgreSQL), and **Telegram** notifications.

## Stack

- Node.js 20 + TypeScript
- Fastify (HTTP server)
- Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- Zod validation
- Telegram Bot API

## Quick start

```powershell
pnpm install
copy .env.example .env
pnpm prisma migrate dev
pnpm dev
```

- API: http://localhost:3000
- Health: http://localhost:3000/health

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | `file:./dev.db` (SQLite dev) |
| `TELEGRAM_BOT_TOKEN` | From [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | From [@userinfobot](https://t.me/userinfobot) |
| `API_KEY` | Secret for `GET /api/responses` |
| `PORT` | Default `3000` |
| `CORS_ORIGIN` | Frontend URL, e.g. `http://localhost:5173` |

> Bot setup guide: [TELEGRAM.md](TELEGRAM.md)

## API

### `POST /api/survey`

Submit survey response (no auth).

### `GET /api/responses`

Paginated responses. Header: `x-api-key: your-key`

```bash
curl -H "x-api-key: dev-secret-key" "http://localhost:3000/api/responses?page=1"
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run production build |
| `pnpm test` | Unit + integration tests |
| `pnpm prisma:migrate` | Run migrations |

## Docker (SQLite)

```bash
copy .env.example .env
docker compose up --build
```

Data persists in the `sqlite_data` Docker volume at `/data/lumiere.db`.

## Deploy on Render (SQLite + persistent disk)

1. Connect repo [lumiere-survey-back](https://github.com/harrisondiaz/lumiere-survey-back)
2. **Runtime:** Docker
3. Add a **Persistent Disk** (1 GB) mounted at `/data`
4. Environment variables:

```env
DATABASE_URL=file:/data/lumiere.db
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=272628414
API_KEY=una-clave-segura
CORS_ORIGIN=https://tu-app.vercel.app
```

Do **not** set `PORT` — Render injects it automatically.

Or use the included [`render.yaml`](render.yaml) Blueprint.

## Frontend

This backend is designed to work with the independent frontend repo/project:
**lumiere-survey-frontend** (or `../lumiere-survey-frontend` if kept locally).

Set `CORS_ORIGIN` to your frontend URL and configure `VITE_API_URL` on the frontend.

## License

MIT
