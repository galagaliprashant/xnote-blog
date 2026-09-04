#!/usr/bin/env node
// QA-style integration runner: drives the real FE in a real browser and
// checks that the real backend actually recorded each interaction. Not a
// mock — every scenario below performs a genuine FE action, then verifies
// it server-side via the API.
//
// Usage:
//   OPS_CONSOLE_TOKEN=... node runner/run.js [--base-url http://localhost:3000]
//
// Requires: `npm install` (pulls in playwright), the backend configured
// (Vercel KV + OPS_CONSOLE_TOKEN), and the target deployment/dev server
// already running.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const REPORTS_DIR = path.join(__dirname, 'reports');
const LOG_PATH = path.join(__dirname, 'LOG.md');
const TOKEN_KEY = 'cw_ops_console_token';

function getArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const BASE_URL = getArg('--base-url', process.env.BASE_URL || 'http://localhost:3000');
const TOKEN = process.env.OPS_CONSOLE_TOKEN;

async function apiGet(pathname) {
  const res = await fetch(`${BASE_URL}${pathname}`, { headers: { 'x-ops-token': TOKEN } });
  if (!res.ok) throw new Error(`GET ${pathname} -> ${res.status}`);
  return res.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scenarioCaseToggle(page) {
  const checkbox = page.locator('.case-check').first();
  const wasChecked = await checkbox.isChecked();
  await checkbox.click();
  await sleep(500); // let the fire-and-forget POST /api/event land

  const log = await apiGet('/api/log?limit=1');
  const last = log.log[0];
  if (!last || last.type !== 'case-toggle') {
    throw new Error(`Expected last log entry to be case-toggle, got ${JSON.stringify(last)}`);
  }
  if (last.detail.done === wasChecked) {
    throw new Error('Backend-recorded done state did not flip as expected');
  }
  return { wasChecked, recordedDone: last.detail.done };
}

async function scenarioPositioningAnswer(page) {
  await page.click('nav button[data-tab="positioning"]');
  const marker = `runner-check-${Date.now()}`;
  const textarea = page.locator('#stepInput');
  await textarea.fill(marker);
  await sleep(900); // debounce (600ms) + margin for the POST to land

  const log = await apiGet('/api/log?limit=1');
  const last = log.log[0];
  if (!last || last.type !== 'positioning-answer' || last.detail.text !== marker) {
    throw new Error(`positioning-answer not recorded correctly: ${JSON.stringify(last)}`);
  }

  const state = await apiGet('/api/state');
  if (state.positioning.answers[last.detail.stepIndex] !== marker) {
    throw new Error('Backend state does not reflect the typed positioning answer');
  }
  return { marker };
}

async function scenarioActivityTabRenders(page) {
  await page.click('nav button[data-tab="activity"]');
  await page.waitForSelector('#activityList .activity-item', { timeout: 5000 });
  const count = await page.locator('#activityList .activity-item').count();
  if (count < 1) throw new Error('Activity tab rendered no entries');
  return { entriesRendered: count };
}

const scenarios = [
  { name: 'case-toggle roundtrip (FE click -> BE log + state)', run: scenarioCaseToggle },
  { name: 'positioning answer roundtrip (FE type -> BE log + state)', run: scenarioPositioningAnswer },
  { name: 'activity tab renders backend log', run: scenarioActivityTabRenders },
];

async function main() {
  if (!TOKEN) {
    console.error('Missing OPS_CONSOLE_TOKEN env var.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(
    ([key, token]) => window.localStorage.setItem(key, token),
    [TOKEN_KEY, TOKEN]
  );
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await sleep(500); // let the initial GET /api/state (loadStateFromBackend) resolve

  const results = [];
  for (const scenario of scenarios) {
    const startedAt = Date.now();
    try {
      const detail = await scenario.run(page);
      results.push({ name: scenario.name, pass: true, detail, ms: Date.now() - startedAt });
      console.log(`PASS  ${scenario.name}`);
    } catch (err) {
      results.push({ name: scenario.name, pass: false, error: String(err), ms: Date.now() - startedAt });
      console.error(`FAIL  ${scenario.name} — ${err}`);
    }
  }

  await browser.close();

  const report = {
    ts: new Date().toISOString(),
    baseUrl: BASE_URL,
    passed: results.filter((r) => r.pass).length,
    total: results.length,
    results,
  };

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, `${report.ts.replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  const summaryLine = `- ${report.ts} — ${report.passed}/${report.total} passed — ${BASE_URL} — [report](reports/${path.basename(reportPath)})\n`;
  const marker = '<!-- entries below, newest first — appended by runner/run.js, don\'t hand-edit -->\n';
  const existingLog = fs.readFileSync(LOG_PATH, 'utf8');
  const markerIdx = existingLog.indexOf(marker);
  const updatedLog =
    markerIdx === -1
      ? existingLog + '\n' + summaryLine
      : existingLog.slice(0, markerIdx + marker.length) +
        summaryLine +
        existingLog.slice(markerIdx + marker.length);
  fs.writeFileSync(LOG_PATH, updatedLog);

  console.log(`\n${report.passed}/${report.total} scenarios passed. Report: ${reportPath}`);
  process.exit(report.passed === report.total ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
