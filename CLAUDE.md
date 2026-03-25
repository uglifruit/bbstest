@AGENTS.md

# Project: Green BBS

An 80s BBS-style public message board built with Next.js + Supabase.

## Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL) — table: `messages`
- **Styling:** Tailwind CSS + custom CSS (CRT/phosphor green aesthetic)
- **Deployment:** Vercel — https://bbs-app-theta-eight.vercel.app
- **Repo:** https://github.com/uglifruit/bbstest

## Key files
- `app/page.tsx` — full client-side UI (boot sequence + message board + compose form)
- `app/api/messages/route.ts` — GET (last 12 msgs) and POST (new msg) API routes
- `lib/supabase.ts` — lazy Supabase client (safe at build time if env vars missing)
- `supabase-schema.sql` — schema + RLS policies to run in Supabase SQL Editor

## Environment variables
Set in `.env.local` (local) and Vercel project settings (production):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database schema
```sql
messages (id BIGSERIAL PK, handle TEXT, message TEXT, created_at TIMESTAMPTZ)
```
RLS enabled: public SELECT and INSERT allowed, no UPDATE/DELETE.

## Constraints
- Handle: max 20 chars
- Message: max 500 chars
- Only the last 12 messages are shown (ordered by `created_at DESC`)
