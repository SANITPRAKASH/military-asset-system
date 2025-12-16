// routes/assignments.js 

import express from 'express';
import { authenticateToken, authorizeRoles, auditLog } from '../middleware/auth.js';

const router = express.Router();

/* ============================
   GET ASSIGNMENTS
============================ */
router.get('/', authenticateToken, async (req, res) => {
  console.log('➡️ GET /assignments');
  console.log('👤 User:', req.user);

  const db = req.app.get('db');

  try {
    let query = `
      SELECT asn.*, 
             a.serial_number,
             et.type_name, et.category,
             b.base_name,
             u.username as created_by_name
      FROM assignments asn
      JOIN assets a ON asn.asset_id = a.asset_id
      JOIN equipment_types et ON a.equipment_type_id = et.type_id
      JOIN bases b ON a.current_base_id = b.base_id
      LEFT JOIN users u ON asn.created_by = u.user_id
      WHERE 1=1
    `;

    const params = [];

    if (req.user.role !== 'admin') {
      query += ' AND a.current_base_id = $1';
      params.push(req.user.base_id);
      console.log('🔒 Base filter applied:', req.user.base_id);
    } else {
      console.log('🧑‍💼 Admin access – no base filter');
    }

    query += ' ORDER BY asn.assignment_date DESC';

    console.log('🧾 Final SQL:', query);
    console.log('📦 Params:', params);

    const result = await db.query(query, params);

    console.log('✅ Assignments fetched:', result.rowCount);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/* ============================
   CREATE ASSIGNMENT
============================ */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'base_commander'),
  auditLog('CREATE_ASSIGNMENT', 'assignments'),
  async (req, res) => {
    console.log('➡️ POST /assignments');
    console.log('📦 Body:', req.body);
    console.log('👤 User:', req.user);

    const db = req.app.get('db');
    const { asset_id, assigned_to, personnel_id, assignment_date, notes } = req.body;

    if (!asset_id || !assigned_to || !assignment_date) {
      console.log('⚠️ Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      console.log('🔎 Checking asset availability:', asset_id);

      const assetCheck = await db.query(
        'SELECT status, current_base_id FROM assets WHERE asset_id = $1',
        [asset_id]
      );

      if (assetCheck.rows.length === 0) {
        console.log('❌ Asset not found');
        return res.status(404).json({ error: 'Asset not found' });
      }

      const asset = assetCheck.rows[0];
      console.log('📦 Asset state:', asset);

      if (asset.status !== 'available') {
        console.log('🚫 Asset not available');
        return res.status(400).json({
          error: 'Asset is not available for assignment'
        });
      }

      console.log('📝 Creating assignment record');

      const result = await db.query(
        `
        INSERT INTO assignments
        (asset_id, assigned_to, personnel_id, assignment_date, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [asset_id, assigned_to, personnel_id, assignment_date, notes, req.user.user_id]
      );

      console.log('🔁 Updating asset status → assigned');

      await db.query(
        'UPDATE assets SET status = $1 WHERE asset_id = $2',
        ['assigned', asset_id]
      );

      console.log('✅ Assignment created:', result.rows[0].assignment_id);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('❌ Create assignment error:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  }
);

/* ============================
   RETURN ASSET
============================ */
router.put(
  '/:id/return',
  authenticateToken,
  authorizeRoles('admin', 'base_commander'),
  auditLog('RETURN_ASSET', 'assignments'),
  async (req, res) => {
    console.log('➡️ PUT /assignments/:id/return');
    console.log('🆔 Assignment ID:', req.params.id);
    console.log('👤 User:', req.user);

    const db = req.app.get('db');
    const { id } = req.params;

    try {
      console.log('🔁 Marking assignment as returned');

      const result = await db.query(
        `
        UPDATE assignments
        SET status = 'returned',
            return_date = CURRENT_DATE
        WHERE assignment_id = $1
          AND status = 'active'
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        console.log('⚠️ Assignment not found or already returned');
        return res.status(404).json({
          error: 'Assignment not found or already returned'
        });
      }

      console.log('🔄 Updating asset status → available');

      await db.query(
        'UPDATE assets SET status = $1 WHERE asset_id = $2',
        ['available', result.rows[0].asset_id]
      );

      console.log('✅ Asset returned successfully');
      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Return asset error:', error);
      res.status(500).json({ error: 'Failed to return asset' });
    }
  }
);

export default router;
