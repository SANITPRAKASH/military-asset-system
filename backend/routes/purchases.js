// routes/purchases.js - Purchase management routes (ESM)

import express from 'express';
import { authenticateToken, authorizeRoles, auditLog } from '../middleware/auth.js';

const router = express.Router();

/* ============================
   GET ALL PURCHASES
============================ */
router.get('/', authenticateToken, async (req, res) => {
  console.log('➡️ GET /purchases called');
  console.log('👤 User:', req.user);
  console.log('🔍 Query params:', req.query);

  const db = req.app.get('db');
  const { base_id, start_date, end_date, equipment_type } = req.query;

  try {
    let query = `
      SELECT p.*, et.type_name, et.category, b.base_name,
             u.username as created_by_name
      FROM purchases p
      JOIN equipment_types et ON p.equipment_type_id = et.type_id
      JOIN bases b ON p.base_id = b.base_id
      LEFT JOIN users u ON p.created_by = u.user_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    // Base filter
    if (req.user.role !== 'admin') {
      query += ` AND p.base_id = $${++paramCount}`;
      params.push(req.user.base_id);
      console.log('🔒 Base filter applied (non-admin)');
    } else if (base_id) {
      query += ` AND p.base_id = $${++paramCount}`;
      params.push(base_id);
      console.log('🧑‍💼 Admin base filter applied');
    }

    if (start_date) {
      query += ` AND p.purchase_date >= $${++paramCount}`;
      params.push(start_date);
      console.log('📅 Start date filter:', start_date);
    }

    if (end_date) {
      query += ` AND p.purchase_date <= $${++paramCount}`;
      params.push(end_date);
      console.log('📅 End date filter:', end_date);
    }

    if (equipment_type) {
      query += ` AND et.type_name ILIKE $${++paramCount}`;
      params.push(`%${equipment_type}%`);
      console.log('🧰 Equipment type filter:', equipment_type);
    }

    query += ' ORDER BY p.purchase_date DESC, p.created_at DESC';

    console.log('🧾 Final SQL:', query);
    console.log('📦 Params:', params);

    const result = await db.query(query, params);

    console.log('✅ Purchases fetched:', result.rowCount);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

/* ============================
   GET SINGLE PURCHASE
============================ */
router.get('/:id', authenticateToken, async (req, res) => {
  console.log('➡️ GET /purchases/:id');
  console.log('🆔 Purchase ID:', req.params.id);

  const db = req.app.get('db');
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT p.*, et.type_name, et.category, b.base_name,
             u.username as created_by_name
      FROM purchases p
      JOIN equipment_types et ON p.equipment_type_id = et.type_id
      JOIN bases b ON p.base_id = b.base_id
      LEFT JOIN users u ON p.created_by = u.user_id
      WHERE p.purchase_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      console.log('⚠️ Purchase not found');
      return res.status(404).json({ error: 'Purchase not found' });
    }

    const purchase = result.rows[0];

    if (req.user.role !== 'admin' && purchase.base_id !== req.user.base_id) {
      console.log('🚫 Access denied for user:', req.user.user_id);
      return res.status(403).json({ error: 'Access denied to this purchase' });
    }

    console.log('✅ Purchase fetched successfully');
    res.json(purchase);
  } catch (error) {
    console.error('❌ Get purchase error:', error);
    res.status(500).json({ error: 'Failed to fetch purchase' });
  }
});

/* ============================
   CREATE PURCHASE
============================ */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'base_commander'),
  auditLog('CREATE_PURCHASE', 'purchases'),
  async (req, res) => {
    console.log('➡️ POST /purchases');
    console.log('📦 Body:', req.body);

    const db = req.app.get('db');
    const {
      base_id,
      equipment_type_id,
      quantity,
      purchase_date,
      unit_cost,
      vendor,
      notes
    } = req.body;

    if (!base_id || !equipment_type_id || !quantity || !purchase_date) {
      console.log('⚠️ Missing required fields');
      return res.status(400).json({
        error: 'Base, equipment type, quantity, and purchase date are required'
      });
    }

    if (req.user.role !== 'admin' && base_id !== req.user.base_id) {
      console.log('🚫 User tried creating purchase for another base');
      return res.status(403).json({ error: 'Cannot create purchase for other bases' });
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');
      console.log('🔁 Transaction started');

      const total_cost = unit_cost ? unit_cost * quantity : null;

      const purchaseResult = await client.query(
        `
        INSERT INTO purchases
        (base_id, equipment_type_id, quantity, purchase_date, unit_cost,
         total_cost, vendor, notes, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        [
          base_id,
          equipment_type_id,
          quantity,
          purchase_date,
          unit_cost,
          total_cost,
          vendor,
          notes,
          req.user.user_id
        ]
      );

      const purchase = purchaseResult.rows[0];
      console.log('📝 Purchase created:', purchase.purchase_id);

      for (let i = 0; i < quantity; i++) {
        await client.query(
          `
          INSERT INTO assets (equipment_type_id, current_base_id, status)
          VALUES ($1, $2, 'available')
          `,
          [equipment_type_id, base_id]
        );
      }

      console.log('📦 Assets created:', quantity);

      await client.query('COMMIT');
      console.log('✅ Transaction committed');

      res.status(201).json(purchase);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Create purchase error:', error);
      res.status(500).json({ error: 'Failed to create purchase' });
    } finally {
      client.release();
      console.log('🔌 DB client released');
    }
  }
);

/* ============================
   UPDATE PURCHASE
============================ */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'base_commander'),
  auditLog('UPDATE_PURCHASE', 'purchases'),
  async (req, res) => {
    console.log('➡️ PUT /purchases/:id');
    console.log('🆔 ID:', req.params.id);
    console.log('📦 Body:', req.body);

    const db = req.app.get('db');
    const { id } = req.params;
    const { unit_cost, vendor, notes } = req.body;

    try {
      const checkResult = await db.query(
        'SELECT base_id FROM purchases WHERE purchase_id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        console.log('⚠️ Purchase not found');
        return res.status(404).json({ error: 'Purchase not found' });
      }

      if (
        req.user.role !== 'admin' &&
        checkResult.rows[0].base_id !== req.user.base_id
      ) {
        console.log('🚫 Unauthorized update attempt');
        return res.status(403).json({ error: 'Access denied' });
      }
  // Update purchase
      const result = await db.query(
        `
        UPDATE purchases
        SET unit_cost = COALESCE($1, unit_cost),
            vendor = COALESCE($2, vendor),
            notes = COALESCE($3, notes),
            total_cost = CASE
              WHEN $1 IS NOT NULL THEN $1 * quantity
              ELSE total_cost
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE purchase_id = $4
        RETURNING *
        `,
        [unit_cost, vendor, notes, id]
      );

      console.log('✅ Purchase updated');
      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Update purchase error:', error);
      res.status(500).json({ error: 'Failed to update purchase' });
    }
  }
);

/* ============================
   DELETE PURCHASE
============================ */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  auditLog('DELETE_PURCHASE', 'purchases'),
  async (req, res) => {
    console.log('➡️ DELETE /purchases/:id');
    console.log('🆔 ID:', req.params.id);

    const db = req.app.get('db');
    const { id } = req.params;

    try {
      const result = await db.query(
        'DELETE FROM purchases WHERE purchase_id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        console.log('⚠️ Purchase not found');
        return res.status(404).json({ error: 'Purchase not found' });
      }

      console.log('🗑️ Purchase deleted');
      res.json({ message: 'Purchase deleted successfully', purchase: result.rows[0] });
    } catch (error) {
      console.error('❌ Delete purchase error:', error);
      res.status(500).json({ error: 'Failed to delete purchase' });
    }
  }
);

/* ============================
   GET EQUIPMENT TYPES
============================ */
router.get('/equipment/types', authenticateToken, async (req, res) => {
  console.log('➡️ GET /purchases/equipment/types');

  const db = req.app.get('db');

  try {
    const result = await db.query(
      'SELECT * FROM equipment_types ORDER BY category, type_name'
    );

    console.log('✅ Equipment types fetched:', result.rowCount);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get equipment types error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment types' });
  }
});

export default router;
