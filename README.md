# Influence

**Collabstr 2.0 for Pakistan** — discover, hire, collaborate, and pay Instagram creators.

Premium, minimal UI (Linear / Stripe energy). MVP ships Instagram-only; the schema is **Creator-centric** so TikTok / YouTube / LinkedIn can plug in later without a migration rewrite.

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui
- Better Auth · Prisma · PostgreSQL · React Query · Framer Motion

## Quick start

### 1. Start Postgres (+ Redis)

```bash
npm run db:up
```

Requires Docker Desktop.

### 2. Env

`.env` is already set for local Docker:

```
DATABASE_URL="postgresql://influence:influence@localhost:5432/influence?schema=public"
```

### 3. Schema + demo data

```bash
npm run db:setup
```

Demo accounts (password `password123`):

| Role    | Email              |
|---------|--------------------|
| Brand   | brand@influence.pk |
| Creator | sara@influence.pk  |
| Creator | ali@influence.pk   |

### 4. Dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Product surface (MVP)

**Creator:** signup → connect Instagram (demo OAuth) → profile → offers → messages · reviews  
**Brand:** discover (search + filters) → creator profile → send offer → chat · save · review

## Architecture note

```
CreatorProfile
 ├── SocialAccount (INSTAGRAM)   ← MVP
 ├── SocialAccount (TIKTOK)      ← future
 ├── SocialAccount (YOUTUBE)     ← future
 └── SocialMetric / SocialPost
```

## Meta Instagram OAuth

See [docs/instagram-setup.md](docs/instagram-setup.md).

Set `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`, and `TOKEN_ENCRYPTION_KEY`.  
Until then, creator onboarding uses a **demo** Instagram connect.

Flow when configured:

1. `/api/instagram/connect` → Instagram OAuth
2. `/api/instagram/callback` → token exchange + profile sync
3. `/api/instagram/sync` → refresh analytics
4. `/api/instagram/status` → connection status

## Scripts

| Script            | Purpose                    |
|-------------------|----------------------------|
| `npm run db:up`   | Docker Postgres + Redis    |
| `npm run db:setup`| Push schema + seed         |
| `npm run db:seed` | Re-seed demo creators      |
| `npm run dev`     | Next.js dev server         |
