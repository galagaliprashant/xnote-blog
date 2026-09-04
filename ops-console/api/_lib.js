const { kv } = require('@vercel/kv');
const fs = require('fs');
const path = require('path');
const { parseMasterplan } = require('../scripts/parse-masterplan');

const STATE_KEY = 'ops-console:state';
const LOG_KEY = 'ops-console:log';
const LOG_MAX = 500;

function checkToken(req, res) {
  const expected = process.env.OPS_CONSOLE_TOKEN;
  if (!expected) {
    res.status(500).json({ error: 'OPS_CONSOLE_TOKEN is not configured on the server.' });
    return false;
  }
  const provided = req.headers['x-ops-token'];
  if (provided !== expected) {
    res.status(401).json({ error: 'Missing or invalid x-ops-token header.' });
    return false;
  }
  return true;
}

function defaultPositioning() {
  return { currentStep: 0, answers: ['', '', '', '', ''], bio: '', intro: '' };
}

// Seeds initial state from MASTERPLAN.md the first time /api/state is read
// and nothing is in KV yet, so the tracker isn't empty before the first
// explicit `npm run sync`.
function seedFromMasterplan() {
  const markdownPath = path.join(__dirname, '..', 'MASTERPLAN.md');
  const markdown = fs.readFileSync(markdownPath, 'utf8');
  const parsed = parseMasterplan(markdown);
  return {
    suites: parsed.suites.map((s) => ({ ...s, collapsed: false })),
    positioning: defaultPositioning(),
  };
}

async function getState() {
  const existing = await kv.get(STATE_KEY);
  if (existing) return existing;
  const seeded = seedFromMasterplan();
  await kv.set(STATE_KEY, seeded);
  return seeded;
}

async function setState(state) {
  await kv.set(STATE_KEY, state);
}

async function appendLog(entry) {
  const record = { ts: new Date().toISOString(), ...entry };
  await kv.lpush(LOG_KEY, JSON.stringify(record));
  await kv.ltrim(LOG_KEY, 0, LOG_MAX - 1);
  return record;
}

async function getLog(limit) {
  const raw = await kv.lrange(LOG_KEY, 0, Math.max(0, limit - 1));
  return raw.map((entry) => (typeof entry === 'string' ? JSON.parse(entry) : entry));
}

module.exports = {
  checkToken,
  getState,
  setState,
  appendLog,
  getLog,
  seedFromMasterplan,
};
