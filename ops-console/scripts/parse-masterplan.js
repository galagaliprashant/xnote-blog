// Parses MASTERPLAN.md into { suites: [...] }.
//
// Grammar:
//   ## Suite Name              -> suite, id = slugified heading
//   priority: <text>           -> suite.priority   (must appear before any list item)
//   why: <text>                -> suite.why
//   - [ ] status: text         -> case, status in {proposed, approved, dropped}
//   - [x] status: text         -> case, done = true
//
// Only `approved` cases (done or not) are kept in the returned suites —
// `proposed` stays plan-only, `dropped` is excluded entirely.

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const HEADING_RE = /^##\s+(.+)$/;
const META_RE = /^(priority|why):\s*(.*)$/i;
const CASE_RE = /^-\s*\[( |x|X)\]\s*(proposed|approved|dropped)\s*:\s*(.+)$/;

function parseMasterplan(markdown) {
  const lines = markdown.split(/\r?\n/);
  const suites = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    const heading = line.match(HEADING_RE);
    if (heading) {
      current = {
        id: slugify(heading[1]),
        name: heading[1].trim(),
        priority: '',
        why: '',
        cases: [],
      };
      suites.push(current);
      continue;
    }

    if (!current) continue;

    const meta = line.match(META_RE);
    if (meta) {
      const key = meta[1].toLowerCase();
      current[key] = meta[2].trim();
      continue;
    }

    const caseMatch = line.match(CASE_RE);
    if (caseMatch) {
      const [, doneMark, status, text] = caseMatch;
      current.cases.push({
        text: text.trim(),
        done: doneMark.toLowerCase() === 'x',
        status: status.toLowerCase(),
      });
    }
  }

  // Only approved cases are live; proposed/dropped are filtered out here.
  return {
    suites: suites.map((suite) => ({
      id: suite.id,
      name: suite.name,
      priority: suite.priority,
      why: suite.why,
      cases: suite.cases
        .filter((c) => c.status === 'approved')
        .map((c) => ({ text: c.text, done: c.done })),
    })),
  };
}

module.exports = { parseMasterplan, slugify };
