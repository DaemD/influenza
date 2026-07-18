# Influence

**Collabstr 2.0 for Pakistan** — discover, hire, collaborate, and pay Instagram creators.

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui
- Better Auth · Prisma · PostgreSQL · React Query · Framer Motion

## Quick start

### Local with Docker Postgres

```bash
npm install
npm run db:up
npm run db:setup
npm run dev
```

### Or point at Railway Postgres

1. In Railway Postgres → **Connect** → copy the **public** `DATABASE_URL` (not `*.railway.internal`)
2. Put it in `.env` as `DATABASE_URL=...`
3. Run:

```bash
npm install
npx prisma db push
npm run db:seed   # optional demo users
npm run dev
```

Demo accounts after seed (password `password123`):

| Role | Email |
|---|---|
| Brand | brand@influence.pk |
| Creator | sara@influence.pk |

## Railway deploy

Web service env must include:

- `DATABASE_URL` → reference from Postgres (`postgres.railway.internal` is fine **on Railway**)
- `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL` → `https://influence.miless.app` (no trailing slash)
- `META_*` + `TOKEN_ENCRYPTION_KEY` + strong `BETTER_AUTH_SECRET`

Start command runs `prisma db push && next start` so tables are created on boot.

## Instagram OAuth

See [docs/instagram-setup.md](docs/instagram-setup.md).
