// routes/api_links.js
import express from 'express';
import { query } from '../lib/db.js';
import { isValidCode, isValidUrl } from '../lib/validate.js';
import { customAlphabet } from 'nanoid';

const router = express.Router();
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6);

// GET /api/links - list all links
router.get('/', async (req, res) => {
  try {
    const r = await query('SELECT code, target, clicks, last_clicked, created_at FROM links ORDER BY created_at DESC');
    return res.status(200).json(r.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/links - create link (409 if code exists)
router.post('/', async (req, res) => {
  try {
    const { target, code: customCode } = req.body || {};

    if (!target || !isValidUrl(target)) {
      return res.status(400).json({ error: 'Invalid target URL' });
    }

    let code = customCode && String(customCode).trim();
    if (code) {
      if (!isValidCode(code)) {
        return res.status(400).json({ error: 'Custom code must match [A-Za-z0-9]{6,8}' });
      }
      // check exists
      const ex = await query('SELECT 1 FROM links WHERE code=$1', [code]);
      if (ex.rowCount > 0) return res.status(409).json({ error: 'Code already exists' });
    } else {
      // generate unique code
      let tries = 0;
      do {
        code = nanoid();
        const ex = await query('SELECT 1 FROM links WHERE code=$1', [code]);
        if (ex.rowCount === 0) break;
        tries++;
      } while (tries < 10);
    }

    await query('INSERT INTO links(code, target) VALUES($1, $2)', [code, target]);
    return res.status(201).json({ code, target });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// GET /api/links/:code - stats for one code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    if (!isValidCode(code)) return res.status(400).json({ error: 'Invalid code format' });

    const r = await query('SELECT code, target, clicks, last_clicked, created_at FROM links WHERE code=$1', [code]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// DELETE /api/links/:code - delete link
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    if (!isValidCode(code)) return res.status(400).json({ error: 'Invalid code format' });

    const r = await query('DELETE FROM links WHERE code=$1 RETURNING code', [code]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
