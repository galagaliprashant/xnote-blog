const { checkToken, getState, setState, appendLog, seedFromMasterplan } = require('./_lib');

// Applies one FE interaction to server-side state. `type` matches the
// actions the FE already performs locally (see index.html's saveState()
// call sites) so each one just gets mirrored here.
function applyEvent(state, event) {
  const { type, payload = {} } = event;
  const suites = state.suites;

  switch (type) {
    case 'case-toggle': {
      const suite = suites.find((s) => s.id === payload.suiteId);
      if (suite && suite.cases[payload.caseIndex]) {
        suite.cases[payload.caseIndex].done = !!payload.done;
      }
      break;
    }
    case 'case-add': {
      const suite = suites.find((s) => s.id === payload.suiteId);
      if (suite && payload.text) {
        suite.cases.push({ text: payload.text, done: false });
      }
      break;
    }
    case 'case-remove': {
      const suite = suites.find((s) => s.id === payload.suiteId);
      if (suite) suite.cases.splice(payload.caseIndex, 1);
      break;
    }
    case 'suite-collapse': {
      const suite = suites.find((s) => s.id === payload.suiteId);
      if (suite) suite.collapsed = !!payload.collapsed;
      break;
    }
    case 'positioning-answer': {
      state.positioning.answers[payload.stepIndex] = payload.text || '';
      break;
    }
    case 'positioning-step': {
      state.positioning.currentStep = payload.currentStep;
      break;
    }
    case 'positioning-bio': {
      state.positioning.bio = payload.bio || '';
      break;
    }
    case 'positioning-intro': {
      state.positioning.intro = payload.intro || '';
      break;
    }
    case 'reset': {
      return null; // signal caller to reseed from masterplan
    }
    default:
      throw new Error(`Unknown event type: ${type}`);
  }
  return state;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  if (!checkToken(req, res)) return;

  const event = req.body || {};
  if (!event.type) {
    res.status(400).json({ error: 'Missing event "type".' });
    return;
  }

  try {
    let next;
    if (event.type === 'reset') {
      next = seedFromMasterplan();
    } else {
      const state = await getState();
      next = applyEvent(state, event);
    }
    if (next) {
      await setState(next);
    }
    const logged = await appendLog({ type: event.type, detail: event.payload || {} });
    res.status(200).json({ ok: true, logged });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
};
