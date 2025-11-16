# Jewel Site Booster

Small, focused frontend for a jewelry landing page with simple analytics.

What this repo contains
- React + TypeScript frontend built with Vite
- Tailwind CSS for styling
- A lightweight analytics pipeline: client-side event calls in `src/lib/analytics.ts` and a Supabase Edge Function at `supabase/functions/track-event/index.ts` that inserts into Postgres tables (`page_visits`, `click_events`).

Quick start (local)
1. Install deps: `npm install`
2. Copy `.env.example` -> `.env` and fill client vars (do not commit `.env`)
3. Run dev server: `npm run dev`

Env notes
- Frontend (client) needs only public keys:
	- VITE_SUPABASE_URL
	- VITE_SUPABASE_PUBLISHABLE_KEY
- Server function requires the service key and must be set in Supabase function runtime:
	- SUPABASE_SERVICE_ROLE_KEY (server-only)

Deploy notes
- Host the frontend (Vercel recommended). Add the `VITE_*` vars in Vercel Project Settings and redeploy — Vite embeds envs at build time.
- Deploy the Edge Function to your Supabase project and set `SUPABASE_SERVICE_ROLE_KEY` in the function runtime.

Testing & verification
- Use the browser DevTools Network tab to watch POSTs to `/functions/v1/track-event`.
- Check Supabase Dashboard → Functions → Logs for function activity and Database → Table Editor for inserted rows.

Security
- Never commit service keys. Keep `.env` in `.gitignore` and use `.env.example` for onboarding.

If you want a shorter or longer README, or a separate `DEPLOY.md` / `SECURITY.md`, tell me which and I’ll add it.

## About this repo

This is a small e-commerce marketing front-end built with Vite + React + TypeScript + Tailwind. It includes lightweight analytics that records page visits and button clicks into a Supabase Postgres database via a Supabase Edge Function (`supabase/functions/track-event`). The tracking is intentionally minimal and designed to be self-hosted (Supabase) while the frontend can be hosted on Vercel or other static hosts.

This README explains how to run the project locally, how analytics works, how to deploy, and how to secure your keys.

## Quick links
- Repo root: this file
- Dev entry: `src/main.tsx`
- Supabase function: `supabase/functions/track-event/index.ts`
- Supabase migrations: `supabase/migrations/`

## Features
- React + TypeScript frontend scaffolded with Vite
- Tailwind CSS for styling
- Small analytics system:
	- Client: `src/lib/analytics.ts` captures UTMs and a session id and calls the Edge Function
	- Server: Supabase Edge Function inserts rows into `page_visits` and `click_events`
	- DB schema in `supabase/migrations`

## Local development

Prerequisites:
- Node.js (recommended LTS) + npm
- Optional: Deno if you run the function locally

1. Install dependencies

```bash
npm install
```

2. Local env file (development only)
- Copy `.env.example` to `.env` and fill values for local testing. The repo intentionally keeps `.env` out of source control.
- Example vars required for local dev (only client keys in `.env`):

	VITE_SUPABASE_URL=https://<your-project>.supabase.co
	VITE_SUPABASE_PUBLISHABLE_KEY=<your_anon_publishable_key>

3. Run the dev server

```bash
npm run dev
```

4. Optional: run the Supabase Edge Function locally (for advanced testing)

- The function is Deno-based. You can run it from `supabase/functions/track-event` with Deno:

```powershell
cd supabase/functions/track-event
deno run --allow-net --allow-env --no-check index.ts
```

This is useful for local end-to-end testing but the recommended path for production is to deploy functions to Supabase.

## Analytics architecture (how tracking works)

- On the client, `src/lib/analytics.ts`:
	- generates or reads a session id (stored in sessionStorage)
	- captures UTM params from the URL and stores them for the session
	- sends events: `trackPageVisit()` on page view and `trackClick()` for CTA clicks
- These calls use the Supabase client or functions API to call the `track-event` Edge Function.
- The Edge Function (server-side) uses a service role key to insert rows into Postgres tables `page_visits` and `click_events`.

CTR (example query)

Here is a starting SQL to calculate per-path CTR (clicks per unique session visit):

```sql
SELECT
	pv.page_path,
	COUNT(DISTINCT pv.session_id) AS visits,
	COUNT(ce.*) AS clicks,
	ROUND(COALESCE(100.0 * COUNT(ce.*) / NULLIF(COUNT(DISTINCT pv.session_id),0),0),2) AS ctr_percent
FROM public.page_visits pv
LEFT JOIN public.click_events ce ON ce.session_id = pv.session_id
GROUP BY pv.page_path
ORDER BY visits DESC;
```

Adjust deduplication logic to match your analytics needs (for example, count unique clicks per session or per element).

## Deploying

Frontend (Vercel recommended)
1. Create a new project on Vercel and connect your GitHub repo.
2. Add environment variables in the Vercel Project Settings → Environment Variables (set for Production):
	 - VITE_SUPABASE_URL (e.g. `https://<project>.supabase.co`)
	 - VITE_SUPABASE_PUBLISHABLE_KEY (your anon/publishable key)
3. Trigger a deployment (Vercel will build with the VITE_* envs). Important: Vite inlines `import.meta.env` at build time — if you change envs later, redeploy.

Supabase Edge Function
1. In Supabase Dashboard → Functions, create a new function named `track-event` and paste the contents of `supabase/functions/track-event/index.ts` (or deploy via `supabase` CLI if you prefer).
2. In Supabase Dashboard (Function settings or Project Settings) add runtime envs for the function:
	 - SUPABASE_URL = https://<project>.supabase.co
	 - SUPABASE_SERVICE_ROLE_KEY = <service role key> (server-secret — do not publish)
3. Deploy the function and note the function invocation URL (e.g., `https://<project>.supabase.co/functions/v1/track-event`).

## Testing & verification

1. Manual test (PowerShell example):

```powershell
$body = @{ type = "page_visit"; data = @{ page_path = "/"; session_id = "smoke-1" } } | ConvertTo-Json -Depth 5
$headers = @{ 'Content-Type' = 'application/json'; 'Authorization' = 'Bearer <PUBLISHABLE_KEY>'; 'apikey' = '<PUBLISHABLE_KEY>' }
Invoke-RestMethod -Uri "https://<project>.supabase.co/functions/v1/track-event" -Method Post -Headers $headers -Body $body
```

2. Verify logs and DB rows:
	- Supabase Dashboard → Functions → track-event → Logs
	- Supabase Dashboard → Database → Table Editor → public.page_visits / public.click_events

3. From deployed frontend: open DevTools → Network and filter requests for `functions/v1/track-event` to confirm POSTs and payloads.

## Environment variables (summary)

Local `.env` (development only — do not commit):
- VITE_SUPABASE_URL (client-safe)
- VITE_SUPABASE_PUBLISHABLE_KEY (anon/public)

Server (Supabase function runtime or serverless host):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (ROUTE/DB admin: store only in server runtime)

## Security checklist

- Never commit `SUPABASE_SERVICE_ROLE_KEY` or other service keys to the repo. `.env` is ignored; keep `.env.example` in the repo.
- If a key is ever exposed, rotate it immediately in Supabase (Project → Settings → API).
- Use the publishable/anon key on the frontend only.

## Troubleshooting

- Wrong project being called from the frontend: ensure Vercel `VITE_SUPABASE_URL` matches the project ref and redeploy — Vite embeds envs at build time.
- 401/403 on function calls: include the anon key in the request headers (`Authorization: Bearer <anon_key>` / `apikey: <anon_key>`) or ensure function settings accept the gateway auth.
- No DB rows: check function logs for insertion errors and confirm the function’s `SUPABASE_URL`/service key match the database where the tables were created.

## Notes for maintainers

- Keep `.env` out of source control. Use `.env.example` for onboarding.
- When debugging, use the function logs and SQL Editor in Supabase — they show the most actionable errors.

---

If you'd like, I can also add a small admin SQL file or a debug endpoint to help query CTR quickly. Tell me what you'd prefer next.

## Analytics (what's implemented)

This project includes lightweight event tracking that records page visits and button click events and stores them in a Supabase Postgres database via a Supabase Edge Function.

- Client-side: `src/lib/analytics.ts` captures a session id, UTM parameters, and sends POST requests to the server function when a page is visited (via `trackPageVisit`) or when a button is clicked (`trackClick`). The `TrackableButton` component wraps buttons and emits click events.
- Server-side: `supabase/functions/track-event/index.ts` is a Deno-based Supabase Edge Function. It requires the server-only `SUPABASE_SERVICE_ROLE_KEY` to insert events into `page_visits` and `click_events` tables.
- Database: migrations live in `supabase/migrations/` and create two tables: `page_visits` and `click_events` with relevant columns (session_id, utm fields, user_agent, created_at, etc.).

CTR (click-through rate) and suggested SQL
- CTR is the ratio of clicks to visits. A simple SQL example (aggregate per page):

	SELECT
		pv.path,
		COUNT(DISTINCT pv.session_id) AS visits,
		COUNT(ce.*) AS clicks,
		ROUND(COALESCE(100.0 * COUNT(ce.*) / NULLIF(COUNT(DISTINCT pv.session_id),0),0),2) AS ctr_percent
	FROM public.page_visits pv
	LEFT JOIN public.click_events ce ON ce.session_id = pv.session_id
	GROUP BY pv.path
	ORDER BY visits DESC;

Use this as a starting point — refine joins and dedup logic to match your analytics model (for example, counting unique clicks per session or event time windows).

## Local development and verifying analytics

1. Install dependencies and run the dev server:

	 npm install
	 npm run dev

2. Start the Supabase Edge Function locally (optional for testing):

	 - You can run the function with Deno or using the Supabase CLI (see project `supabase/functions/track-event`). The function needs `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` in its runtime environment to insert into the DB.

3. Verify events:

	 - In browser DevTools > Network, filter for POST requests to `/track-event` (or whichever host path the function is deployed to). Inspect request payloads for `session_id`, `path`, and UTM fields.
	 - In Supabase Dashboard → Table Editor, open `public.page_visits` and `public.click_events` and confirm new rows arrive.

## Deployment notes (Frontend and Function)

Frontend (Vercel recommended):

- You can host the frontend on Vercel. In Vercel Project Settings → Environment Variables add the public client keys:
	- VITE_SUPABASE_URL
	- VITE_SUPABASE_PUBLISHABLE_KEY

- These are safe to use on the client. Do NOT add the Service Role key to frontend envs.

Backend (Supabase Edge Function):

- Deploy the Edge Function to the same Supabase project that holds your database. The function must have the server-only `SUPABASE_SERVICE_ROLE_KEY` (set in the Function's settings in the Supabase Dashboard or via `supabase` CLI `functions deploy` with environment variables).

If your current hosting (Lovable) does not let you edit server envs, you have two options:

1. Keep the frontend hosted on Lovable and deploy the Supabase Edge Function to Supabase (recommended). The frontend only needs the publishable key and URL to call the function.
2. Use a small serverless proxy (Vercel Serverless Function/Netlify Function) that holds the service key and forwards events to Supabase — but this adds operational overhead and is not necessary if you can deploy Supabase functions.

## Security and secrets

- Never commit `SUPABASE_SERVICE_ROLE_KEY` or any service/admin keys to the repository. Add `.env` to `.gitignore` (already done) and keep an `.env.example` with placeholders (present in this repo).
- If a service role key was accidentally exposed, rotate it immediately in the Supabase Dashboard and update the runtime environment where the function is deployed.
- Use the Supabase Dashboard's
