// routes/transfers.js (ESM)

import express from 'express';
import { authenticateToken, authorizeRoles, auditLog } from '../middleware/auth.js';

const router = express.Router();

/* ============================
   GET ALL TRANSFERS
============================ */
router.get('/', authenticateToken, async (req, res) => {
  console.log('➡️ GET /transfers');
  console.log('👤 User:', req.user);

  const db = req.app.get('db');

  try {
    let query = `
      SELECT t.*, 
             fb.base_name as from_base_name,
             tb.base_name as to_base_name,
             a.serial_number,
             et.type_name, et.category,
             ru.username as requested_by_name,
             au.username as approved_by_name
      FROM transfers t
      JOIN bases fb ON t.from_base_id = fb.base_id
      JOIN bases tb ON t.to_base_id = tb.base_id
      JOIN assets a ON t.asset_id = a.asset_id
      JOIN equipment_types et ON a.equipment_type_id = et.type_id
      LEFT JOIN users ru ON t.requested_by = ru.user_id
      LEFT JOIN users au ON t.approved_by = au.user_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    // Role-based filtering
    if (req.user.role !== 'admin') {
      query += ` AND (t.from_base_id = $${++paramCount} OR t.to_base_id = $${++paramCount})`;
      params.push(req.user.base_id, req.user.base_id);
      console.log('🔒 Base filter applied for non-admin');
    } else {
      console.log('🧑‍💼 Admin access – no base restriction');
    }

    query += ' ORDER BY t.created_at DESC';

    console.log('🧾 Final SQL:', query);
    console.log('📦 Params:', params);

    const result = await db.query(query, params);

    console.log('✅ Transfers fetched:', result.rowCount);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get transfers error:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

/* ============================
   CREATE TRANSFER
============================ */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'base_commander', 'logistics_officer'),
  auditLog('CREATE_TRANSFER', 'transfers'),
  async (req, res) => {
    console.log('➡️ POST /transfers');
    console.log('📦 Body:', req.body);
    console.log('👤 User:', req.user);

    const db = req.app.get('db');
    const { asset_id, from_base_id, to_base_id, transfer_date, quantity, reason } = req.body;

    if (!asset_id || !from_base_id || !to_base_id || !transfer_date) {
      console.log('⚠️ Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (req.user.role !== 'admin' && from_base_id !== req.user.base_id) {
      console.log('🚫 User tried transferring from another base');
      return res.status(403).json({ error: 'Can only transfer from your own base' });
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');
      console.log('🔁 Transaction started');

      const transferResult = await client.query(
        `
        INSERT INTO transfers
        (asset_id, from_base_id, to_base_id, transfer_date, quantity, reason,
         status, requested_by)
        VALUES ($1,$2,$3,$4,$5,$6,'pending',$7)
        RETURNING *
        `,
        [
          asset_id,
          from_base_id,
          to_base_id,
          transfer_date,
          quantity || 1,
          reason,
          req.user.user_id
        ]
      );

      await client.query('COMMIT');
      console.log('✅ Transfer created:', transferResult.rows[0].transfer_id);

      res.status(201).json(transferResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Create transfer error:', error);
      res.status(500).json({ error: 'Failed to create transfer' });
    } finally {
      client.release();
      console.log('🔌 DB client released');
    }
  }
);

/* ============================
   APPROVE TRANSFER
============================ */
router.put(
  '/:id/approve',
  authenticateToken,
  authorizeRoles('admin', 'base_commander'),
  auditLog('APPROVE_TRANSFER', 'transfers'),
  async (req, res) => {
    console.log('➡️ PUT /transfers/:id/approve');
    console.log('🆔 Transfer ID:', req.params.id);
    console.log('👤 User:', req.user);

    const db = req.app.get('db');
    const { id } = req.params;

    const client = await db.connect();

    try {
      await client.query('BEGIN');
      console.log('🔁 Transaction started');
// Get transfer details
      const transferResult = await client.query(
        'SELECT * FROM transfers WHERE transfer_id = $1',
        [id]
      );

      if (transferResult.rows.length === 0) {
        console.log('⚠️ Transfer not found');
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Transfer not found' });
      }

      const transfer = transferResult.rows[0];
      console.log('📄 Transfer details:', transfer);

      if (req.user.role !== 'admin' && transfer.to_base_id !== req.user.base_id) {
        console.log('🚫 Unauthorized approval attempt');
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Can only approve transfers to your base' });
      }

      await client.query(
        `
        UPDATE transfers
        SET status = 'completed',
            approved_by = $1,
            completed_at = CURRENT_TIMESTAMP
        WHERE transfer_id = $2
        `,
        [req.user.user_id, id]
      );

      await client.query(
        'UPDATE assets SET current_base_id = $1 WHERE asset_id = $2',
        [transfer.to_base_id, transfer.asset_id]
      );

      await client.query('COMMIT');
      console.log('✅ Transfer approved and asset moved');

      res.json({ message: 'Transfer approved successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Approve transfer error:', error);
      res.status(500).json({ error: 'Failed to approve transfer' });
    } finally {
      client.release();
      console.log('🔌 DB client released');
    }
  }
);

/* ============================
   CANCEL TRANSFER
============================ */
router.put(
  '/:id/cancel',
  authenticateToken,
  auditLog('CANCEL_TRANSFER', 'transfers'),
  async (req, res) => {
    console.log('➡️ PUT /transfers/:id/cancel');
    console.log('🆔 Transfer ID:', req.params.id);
    console.log('👤 User:', req.user);

    const db = req.app.get('db');
    const { id } = req.params;

    try {
      const result = await db.query(
        `
        UPDATE transfers
        SET status = 'cancelled'
        WHERE transfer_id = $1 AND status = 'pending'
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        console.log('⚠️ Transfer not found or already processed');
        return res.status(404).json({
          error: 'Transfer not found or already processed'
        });
      }

      console.log('🛑 Transfer cancelled:', result.rows[0].transfer_id);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Cancel transfer error:', error);
      res.status(500).json({ error: 'Failed to cancel transfer' });
    }
  }
);

export default router;
