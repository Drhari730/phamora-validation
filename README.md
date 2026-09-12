# PHAMORA Validation Portal

A digital validation portal for the PHAMORA pharmacology-learning app study:
student pre/post-test with usability and app-quality instruments, an expert
CVI review panel, and an investigator dashboard with live stats and data
export (CSV / JSON / multi-sheet Excel).

Stack: Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui ·
Prisma + Postgres · Recharts · exceljs.

## Local development

```bash
npm install
npx prisma db push   # creates/updates tables against DATABASE_URL
npm run seed          # seeds settings, question bank, content items, admin user
npm run dev
```

Copy `.env.example` to `.env` and fill in `DATABASE_URL` (any Postgres
instance — a free [Neon](https://neon.tech) project works well) and
`SESSION_SECRET`. Set `SEED_DEMO_DATA=true` before seeding to also get 3
sample participants and 8 sample experts with ratings, useful for exploring
the UI without running through the flows yourself.

## Deploying (Render + Neon, both free tier)

1. **Database — [Neon](https://neon.tech):** create a free project, then
   copy the pooled connection string from the dashboard (it already
   includes `?sslmode=require`).
2. **Push this repo to GitHub** (see below if it isn't already).
3. **Web service — [Render](https://render.com):** New → Blueprint → point
   it at this repo. `render.yaml` sets the build/start commands and
   generates `SESSION_SECRET` for you; you only need to paste `DATABASE_URL`
   (from step 1) into the service's environment variables.
4. Render's build step runs `prisma db push`, so the schema is created
   automatically on first deploy.
5. **Seed production once**, from your own machine (never paste a DB
   password into a chat or commit it):
   ```bash
   DATABASE_URL="<paste the Neon connection string>" \
   ADMIN_EMAIL="you@yourinstitution.edu" \
   ADMIN_PASSWORD="<a strong password you choose>" \
   npm run seed
   ```
   This creates the question bank, CVI content items, study settings, and
   your real admin login — with no fake demo data.

### About the free tiers

- Render's free web service spins down after 15 minutes idle and takes up
  to ~50s to wake on the next request — fine for a study tool used
  intermittently, not for something needing instant response.
- Neon's free Postgres pauses when idle (wakes automatically) but does
  **not** hard-expire, unlike Render's own free Postgres (30 days). That's
  why the two are paired here instead of using Render for both.
- Use `/admin/export` regularly during data collection to keep your own
  backup — free tiers are not a substitute for one.

## Pushing to GitHub (if not already done)

```bash
gh repo create <name> --private --source=. --remote=origin --push
```
