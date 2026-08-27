# Test Automation Dashboard

A self-contained, dependency-free (plain HTML/CSS/JS) dashboard: select
test modules, run the suite, get a one-click report.

**Status:** the test *execution* is currently mocked (random pass/fail with
simulated delays) — there is no real test runner wired in yet. See
"Wiring in your real test suite" below for the one file you need to change.

## Run it

No build step. Just open `dashboard/index.html` in a browser, or serve the
folder statically, e.g.:

```
cd dashboard
python3 -m http.server 8000
# open http://localhost:8000
```

## Files

- `testConfig.js` — data-driven catalog of modules and testcases
  (`TEST_MODULES`). Edit this array (or generate it from your real suite) to
  change what shows up in the dashboard.
- `testRunner.js` — **the integration point.** Exposes `runTests(selectedModules, { onProgress })`.
  Currently a mock; replace its internals with a real call to your test
  automation suite once it exists. The file's header comment documents the
  exact input/output contract the UI expects.
- `index.html` / `styles.css` / `app.js` — the UI: module selection with
  select-all, a "Run Selected Tests" button, a live per-module/overall
  progress view, and a final report view (summary counts, per-testcase
  pass/fail/skipped badges, durations) with JSON/CSV export.

## Wiring in your real test suite

Everything else (checkbox list, progress bars, report rendering, exports)
already works against the shape `runTests()` returns — you only need to
touch `testRunner.js`. Two common approaches:

1. **Backend endpoint**: replace the mock in `runTestCase()`/`runTests()`
   with `fetch()` calls to a backend that shells out to your runner
   (pytest/Jest/Playwright/etc.) and streams progress back (e.g. via SSE or
   polling a job status endpoint).
2. **CI trigger**: call your CI API (e.g. GitHub Actions
   `workflow_dispatch`) to kick off a run, then poll for its status/results
   and translate them into the same report shape.

As long as `runTests()` keeps its signature and return shape (documented in
`testRunner.js`), no changes are needed in `app.js` or the HTML/CSS.
