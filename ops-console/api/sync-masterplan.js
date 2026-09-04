const { checkToken, getState, setState, appendLog } = require('./_lib');

// Upserts approved masterplan suites/cases into live state, matching
// existing cases by text so `done` flags survive a re-sync. Suites/cases
// no longer present (dropped, or flipped back to proposed) are removed.
function mergeMasterplan(state, incoming) {
  const prevSuitesById = new Map(state.suites.map((s) => [s.id, s]));

  const mergedSuites = incoming.suites.map((suite) => {
    const prevSuite = prevSuitesById.get(suite.id);
    const prevCasesByText = new Map((prevSuite ? prevSuite.cases : []).map((c) => [c.text, c]));

    return {
      id: suite.id,
      name: suite.name,
      priority: suite.priority,
      why: suite.why,
      collapsed: prevSuite ? prevSuite.collapsed : false,
      cases: suite.cases.map((c) => ({
        text: c.text,
        done: prevCasesByText.has(c.text) ? prevCasesByText.get(c.text).done : c.done,
      })),
    };
  });

  return { ...state, suites: mergedSuites };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  if (!checkToken(req, res)) return;

  const incoming = req.body || {};
  if (!Array.isArray(incoming.suites)) {
    res.status(400).json({ error: 'Body must be { suites: [...] } (see scripts/parse-masterplan.js).' });
    return;
  }

  try {
    const state = await getState();
    const merged = mergeMasterplan(state, incoming);
    await setState(merged);
    const logged = await appendLog({
      type: 'masterplan-sync',
      detail: {
        suiteCount: merged.suites.length,
        caseCount: merged.suites.reduce((n, s) => n + s.cases.length, 0),
      },
    });
    res.status(200).json({ ok: true, logged, suiteCount: merged.suites.length });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
};
