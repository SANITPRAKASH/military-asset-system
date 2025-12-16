// routes/bases.js - FULL ESM + SPAM LOGS

import express from 'express';
import { authenticateToken, authorizeRoles, auditLog } from '../middleware/auth.js';

console.log('[ROUTES/BASES] Initializing router...');
const router = express.Router();

// ================================
// GET ALL BASES
// ================================
router.get('/', authenticateToken, async (req, res) => {
  console.log('[BASES] GET / - fetching all bases');
  const db = req.app.get('db');

  try {
    const query = `
      SELECT b.*, u.username as commander_name
      FROM bases b
      LEFT JOIN users u ON b.commander_id = u.user_id
      ORDER BY b.base_name
    `;
    console.log('[BASES] Query:', query);

    const result = await db.query(query);
    console.log('[BASES] Query result rows count:', result.rows.length);

    res.json(result.rows);
  } catch (error) {
    console.error('[BASES] Get all bases ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch bases' });
  }
});

// ================================
// GET SINGLE BASE
// ================================
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log('[BASES] GET /:id - fetching base with id:', id);

  const db = req.app.get('db');
  try {
    const query = `
      SELECT b.*, u.username as commander_name
      FROM bases b
      LEFT JOIN users u ON b.commander_id = u.user_id
      WHERE b.base_id = $1
    `;
    console.log('[BASES] Query:', query);

    const result = await db.query(query, [id]);
    console.log('[BASES] Query result rows count:', result.rows.length);

    if (result.rows.length === 0) {
      console.warn('[BASES] Base not found:', id);
      return res.status(404).json({ error: 'Base not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[BASES] Get single base ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch base' });
  }
});

// ================================
// CREATE BASE
// ================================
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  auditLog('CREATE_BASE', 'bases'),
  async (req, res) => {
    console.log('[BASES] POST / - creating new base');
    const db = req.app.get('db');
    const { base_name, location, commander_id } = req.body;

    console.log('[BASES] Request body:', req.body);

    if (!base_name) {
      console.warn('[BASES] Missing base_name');
      return res.status(400).json({ error: 'Base name is required' });
    }

    try {
      const query = `
        INSERT INTO bases (base_name, location, commander_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      console.log('[BASES] Query:', query);

      const result = await db.query(query, [base_name, location, commander_id || null]);
      console.log('[BASES] Created base:', result.rows[0]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[BASES] Create base ERROR:', error);
      res.status(500).json({ error: 'Failed to create base' });
    }
  }
);

// ================================
// UPDATE BASE
// ================================
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  auditLog('UPDATE_BASE', 'bases'),
  async (req, res) => {
    const { id } = req.params;
    const { base_name, location, commander_id } = req.body;
    console.log('[BASES] PUT /:id - updating base id:', id);
    console.log('[BASES] Request body:', req.body);

    const db = req.app.get('db');

    try {
      const query = `
        UPDATE bases
        SET base_name = COALESCE($1, base_name),
            location = COALESCE($2, location),
            commander_id = COALESCE($3, commander_id)
        WHERE base_id = $4
        RETURNING *
      `;
      console.log('[BASES] Query:', query);

      const result = await db.query(query, [base_name, location, commander_id, id]);
      console.log('[BASES] Query result rows count:', result.rows.length);

      if (result.rows.length === 0) {
        console.warn('[BASES] Base not found for update:', id);
        return res.status(404).json({ error: 'Base not found' });
      }

      console.log('[BASES] Updated base:', result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('[BASES] Update base ERROR:', error);
      res.status(500).json({ error: 'Failed to update base' });
    }
  }
);

console.log('[ROUTES/BASES] Router setup complete');
export default router;
