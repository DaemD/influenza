# Influence

**Collabstr 2.0 for Pakistan** — discover, hire, collaborate, and pay Instagram creators.

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui
- Better Auth (in-memory for now) · React Query · Framer Motion

> **Note:** Postgres/Prisma is temporarily removed. Data lives in an in-memory store and **resets on every server restart/redeploy**. Railway Postgres will be wired back later.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create an account via **Sign up** (no seed DB required). Discover still shows demo creators from the in-memory store.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |

## Instagram OAuth

See [docs/instagram-setup.md](docs/instagram-setup.md). Until Meta is configured, creator onboarding uses **demo** Instagram connect.
