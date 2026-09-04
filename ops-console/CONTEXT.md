# Context Brief — Career Pivot & Personal Brand Ops

*Living document. Kept up to date in the repo instead of only living in chat
uploads — update the "Current status" section whenever something here
changes.*

## The person

QA/SDET professional, 9 years experience, sole QA contributor across IoT,
AWS cloud, API, and app/web testing. Currently on-site 5 days/week at an
aerospace company with no learning runway left there. Runs a small digital
marketing agency ("Parambhaav" — one founder + one junior, still subsidized
by day-job salary, not yet self-sustaining). Has a consistent daily
meditation practice that measurably improves performance and clarity. Wants
to build a personal brand at the intersection of QA-engineer rigor,
meditation, and physical fitness.

## Constraint that shapes everything

**5–10 hours/week, weekends only**, beyond the day job. Every recommendation
is sequenced, not parallel, because of this.

## Decisions made (in order)

1. **Six interest areas were reduced to a single throughline**, not four
   separate niches: *QA-engineer rigor applied to meditation and physical
   transformation.*
2. **Priority ranking:**
   - P1 — Personal brand / positioning statement
   - P2 — Content creator niche (downstream of P1)
   - P3 — Deepen meditation practice (already free)
   - P4 — Vegan six-pack / fitness transformation (deliberately last)
3. **Gating the above:** Remote job search and agency systemization are the
   *true* P1 and P2, because they unlock the hours needed for everything
   else.
   - Remote path: **job**, not from-scratch consulting.
   - Agency: **not scaling yet** — systemize (document SOPs) before any
     hiring or "scale" narrative.
4. **Weekly cadence:**
   - Job search: 3–4 hrs/week — resume/LinkedIn rewrite (once), then 5
     targeted applications + 1 outreach message per week, review conversion
     every 2 weeks.
   - Agency SOPs: 1–2 hrs/week — document one recurring process per week,
     right after doing it.
5. **Positioning exercise** (5-step method): dump raw material → find the
   one connecting word → draft the sentence → stress-test against 3
   audiences (fellow SDET / fellow meditator / does it overpromise) → lock
   the statement + write bio and verbal-intro variants.

## What's been built

- **`ops-console/index.html`** — self-contained tracker: Sprint Board
  (the 5 phases as QA "suites") and Positioning Suite (the 5-step wizard).
- **`ops-console/MASTERPLAN.md`** — source of truth for what's approved;
  syncs into the tracker's live state.
- **`ops-console/api/*`** — Vercel serverless functions (state, event,
  sync-masterplan, log) backed by Vercel KV, so tracker state and an
  activity log persist server-side instead of only in one browser's
  `localStorage`.
- **`ops-console/runner/`** — QA-style integration runner that drives the
  real FE and confirms the backend actually recorded each interaction,
  writing a pass/fail report per run.

## Current status

- [x] Repo folder created and pushed (`ops-console/`).
- [x] PR #2 (initial FE-only tracker) merged to `main`.
- [x] Master plan file created, backend + runner scaffolding built.
- [x] Vercel project `xnote-blog` created and linked to this repo
      (team `prashanth-galagalis-projects`, root directory `ops-console`,
      project id `prj_bigTqP1yhhPGyF6AdEk9xFHC7rm6`) — took a round of the
      Vercel connector needing reauthorization to that team's scope before
      `create_git_project` succeeded.
- [x] PR #3 (masterplan + backend + runner) merged to `main`.
- [x] Production deployment live: https://xnote-blog-gamma.vercel.app
      (Vercel project `xnote-blog`, auto-deploys from `main`).
- [ ] KV database provisioned + `OPS_CONSOLE_TOKEN` set (manual dashboard
      steps — see `ops-console/README.md`). Until this is done, the live
      site works fine but stays in local-storage-only mode (the footer
      "Connect backend" button will 500/401 until then).
- [ ] Positioning Suite steps 1–5 not yet completed by the person.
- [ ] No SOPs documented yet for the agency.
- [ ] No applications sent yet under the new weekly job-search cadence.
- [ ] Cross-device sync question is now answered (Vercel KV backend), but
      only once the manual setup above is done — until then the tracker
      still works locally via `localStorage` only.

## Open items / not yet decided

- Whether the hosted tracker should be public/indexable or not (a
  `robots.txt` was offered earlier, still unresolved).
- Exact content pillars for the consolidated Instagram — explicitly deferred
  until the positioning statement is locked.

## Instruction for whoever/whatever picks this up next

Don't re-litigate the niche or the priority order — both are decided. New
work goes into `MASTERPLAN.md` as `proposed`, gets approved there, then
syncs into the live tracker — don't hand-edit suites/cases into
`index.html` directly. Keep this file's "Current status" section current as
things change.
