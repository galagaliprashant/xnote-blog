const { checkToken, getState } = require('./_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' });
    return;
  }
  if (!checkToken(req, res)) return;

  try {
    const state = await getState();
    res.status(200).json(state);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
