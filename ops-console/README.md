# Ops Console

A tracker for career-pivot and personal-brand work: a self-contained
HTML/CSS/JS front end, backed by a small Vercel API + KV store so progress
persists across devices instead of only one browser's local storage. It
still works FE-only (local storage) if the backend isn't connected.

- **`MASTERPLAN.md`** — source of truth for what's planned/approved. Only
  `approved` items are live in the tracker.
- **`CONTEXT.md`** — the living brief (who this is for, the constraint, the
  decisions made, current status). Kept up to date as things change.
- **`index.html`** — the FE: Sprint Board, Positioning Suite, Activity tabs.
- **`api/`** — Vercel serverless functions (state, event, sync-masterplan,
  log), backed by Vercel KV.
- **`scripts/`** — the masterplan parser + sync CLI.
- **`runner/`** — a QA-style integration runner that drives the real FE and
  checks the backend actually recorded each interaction.

## Run the FE only (no backend)

No build step. Just open `ops-console/index.html` in a browser, or serve the
folder statically:

```
cd ops-console
python3 -m http.server 8000
# open http://localhost:8000
```

Progress saves to local storage and stays fully usable — the "Connect
backend" button in the footer is optional.

## Set up the backend (one-time)

1. Install deps: `cd ops-console && npm install`.
2. In the Vercel dashboard, add a KV database to this project and connect it
   (this injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically).
3. Set an `OPS_CONSOLE_TOKEN` env var on the project — any long random
   string. This is the shared secret the FE, `scripts/sync.js`, and the
   runner all send as the `x-ops-token` header.
4. Locally: `vercel env pull` (or create `ops-console/.env.local` with
   `OPS_CONSOLE_TOKEN=...`), then `npm run dev` to run FE + API together.
5. Open the site, click **Connect backend** in the footer, paste the token.

## Editing the plan

Edit `MASTERPLAN.md` directly — add a suite (`##` heading + `priority:` /
`why:`) or a case (`- [ ] approved: ...` / `proposed` / `dropped`). Then:

```
OPS_CONSOLE_TOKEN=... npm run sync -- --base-url https://your-deployment.vercel.app
```

This pushes approved items into the live tracker (matching existing cases by
text, so `done` state survives a re-sync) and updates the "Last synced" line
in `MASTERPLAN.md`.

## Running the QA runner

```
OPS_CONSOLE_TOKEN=... npm run runner -- --base-url https://your-deployment.vercel.app
```

Drives the real page in a real browser (toggles a case, types a positioning
answer, opens the Activity tab) and verifies the backend recorded each one.
Writes a timestamped JSON report to `runner/reports/` and a one-line summary
to `runner/LOG.md`.

## What's in the Sprint Board

Five work areas (remote job search, agency SOPs, positioning & brand,
content execution, meditation & fitness) framed as QA "suites," each with a
priority tag, a checklist of "cases," and a progress bar. Cases can be
checked off, added, or removed — all of which sync to the backend if
connected.

## Notes

- Without a connected backend, data lives only in that browser's local
  storage.
- With a connected backend, local storage is used as an immediate-render
  cache; the backend is the source of truth once reachable.
- "Reset all data" clears local state and (if connected) re-seeds the
  backend from `MASTERPLAN.md`.
