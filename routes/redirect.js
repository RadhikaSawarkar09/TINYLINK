// routes/redirect.js
import { query } from '../lib/db.js';
import { isValidCode } from '../lib/validate.js';

export async function renderIndex(req, res) {
  // Render dashboard page — client will fetch /api/links
  res.render('index', { baseUrl: process.env.BASE_URL || `${req.protocol}://${req.get('host')}` });
}

export async function renderCode(req, res) {
  const code = String(req.params.code || '');
  if (!isValidCode(code)) return res.status(400).send('Invalid code');

  const r = await query('SELECT code, target, clicks, last_clicked, created_at FROM links WHERE code=$1', [code]);
  if (r.rowCount === 0) return res.status(404).send('Not found');

  res.render('code', { link: r.rows[0], baseUrl: process.env.BASE_URL || `${req.protocol}://${req.get('host')}` });
}

export async function handleRedirect(req, res) {
  const code = String(req.params.code || '');
  if (!isValidCode(code)) return res.status(404).send('Not found');

  const r = await query('SELECT target FROM links WHERE code=$1', [code]);
  if (r.rowCount === 0) return res.status(404).send('Not found');

  const target = r.rows[0].target;

  // Update click stats (can be awaited)
  try {
    await query('UPDATE links SET clicks = clicks + 1, last_clicked = now() WHERE code=$1', [code]);
  } catch (err) {
    console.error('Failed to update stats:', err);
    // don't block redirect on stats failure
  }

  // 302 redirect
  return res.redirect(302, target);
}
