const { checkToken, getLog } = require('./_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' });
    return;
  }
  if (!checkToken(req, res)) return;

  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);

  try {
    const log = await getLog(limit);
    res.status(200).json({ log });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
