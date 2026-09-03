# Ops Console

A self-contained, dependency-free (plain HTML/CSS/JS) tracker for career-pivot
and personal-brand work. No login, no backend — all progress is saved to the
browser's local storage.

## Run it

No build step. Just open `ops-console/index.html` in a browser, or serve the
folder statically:

```
cd ops-console
python3 -m http.server 8000
# open http://localhost:8000
```

## What's in it

- **Sprint Board** — five work areas (remote job search, agency SOPs,
  positioning & brand, content execution, meditation & fitness) framed as
  QA "suites," each with a priority tag, a checklist of "cases," and a
  progress bar. Cases can be checked off, added, or removed.
- **Positioning Suite** — a 5-step wizard (dump raw material → find the
  connecting word → draft the sentence → stress-test it → lock it in) that
  ends in a locked positioning statement plus an Instagram bio variant and a
  verbal intro variant.

## Notes

- Data lives only in the browser's local storage — it does not sync across
  devices or browsers.
- A "Reset all data" link at the bottom clears everything back to the
  defaults.
