#!/usr/bin/env node
// Reads MASTERPLAN.md, parses the approved items, and POSTs them to
// /api/sync-masterplan so the live tracker picks them up.
//
// Usage:
//   OPS_CONSOLE_TOKEN=... node scripts/sync.js [--base-url http://localhost:3000]
//
// Requires the backend to be configured (Vercel KV + OPS_CONSOLE_TOKEN) --
// see README.md. Rewrites the "Last synced:" line in MASTERPLAN.md on success.

const fs = require('fs');
const path = require('path');
const { parseMasterplan } = require('./parse-masterplan');

const MASTERPLAN_PATH = path.join(__dirname, '..', 'MASTERPLAN.md');

function getArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

async function main() {
  const baseUrl = getArg('--base-url', process.env.BASE_URL || 'http://localhost:3000');
  const token = process.env.OPS_CONSOLE_TOKEN;
  if (!token) {
    console.error('Missing OPS_CONSOLE_TOKEN env var.');
    process.exit(1);
  }

  const markdown = fs.readFileSync(MASTERPLAN_PATH, 'utf8');
  const parsed = parseMasterplan(markdown);

  const res = await fetch(`${baseUrl}/api/sync-masterplan`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ops-token': token,
    },
    body: JSON.stringify(parsed),
  });

  if (!res.ok) {
    console.error(`Sync failed: ${res.status} ${await res.text()}`);
    process.exit(1);
  }

  const result = await res.json();
  console.log(
    `Synced ${parsed.suites.reduce((n, s) => n + s.cases.length, 0)} approved case(s) ` +
      `across ${parsed.suites.length} suite(s). Backend: ${JSON.stringify(result)}`
  );

  const updated = markdown.replace(
    /^Last synced:.*$/m,
    `Last synced: ${new Date().toISOString()}`
  );
  fs.writeFileSync(MASTERPLAN_PATH, updated);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
