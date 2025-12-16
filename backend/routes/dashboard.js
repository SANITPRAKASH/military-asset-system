// routes/dashboard.js - Dashboard metrics and data (ES MODULE VERSION)

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/* =========================
   GET /api/dashboard/metrics
========================= */
router.get('/metrics', authenticateToken, async (req, res) => {
  console.log('📊 /metrics route hit');

  const db = req.app.get('db');
  const { base_id, start_date, end_date, equipment_type } = req.query;

  console.log('🔍 Query Params:', req.query);
  console.log('👤 User:', req.user);

  try {
    // Determine target base
    let targetBaseId = null;

    if (req.user.role !== 'admin') {
      targetBaseId = req.user.base_id;
      console.log('🔒 Non-admin user, base locked to:', targetBaseId);
    } else if (base_id) {
      targetBaseId = parseInt(base_id);
      console.log('🛡️ Admin override base:', targetBaseId);
    }

    /* ---------- Opening Balance ---------- */
    let openingQuery = `
      SELECT COALESCE(COUNT(*), 0) as opening_balance
      FROM assets a
      WHERE 1=1
    `;
    let openingParams = [];
    let paramCount = 0;

    if (targetBaseId) {
      openingQuery += ` AND a.current_base_id = $${++paramCount}`;
      openingParams.push(targetBaseId);
    }

    if (start_date) {
      openingQuery += ` AND a.created_at < $${++paramCount}`;
      openingParams.push(start_date);
    }

    console.log('📦 Opening Query:', openingQuery);
    console.log('📦 Opening Params:', openingParams);

    const openingResult = await db.query(openingQuery, openingParams);

    /* ---------- Purchases ---------- */
    paramCount = 0;
    let purchaseParams = [];
    let purchaseQuery = `
      SELECT COALESCE(SUM(p.quantity), 0) as purchases
      FROM purchases p
      WHERE 1=1
    `;

    if (targetBaseId) {
      purchaseQuery += ` AND p.base_id = $${++paramCount}`;
      purchaseParams.push(targetBaseId);
    }
    if (start_date) {
      purchaseQuery += ` AND p.purchase_date >= $${++paramCount}`;
      purchaseParams.push(start_date);
    }
    if (end_date) {
      purchaseQuery += ` AND p.purchase_date <= $${++paramCount}`;
      purchaseParams.push(end_date);
    }

    console.log('🛒 Purchase Query:', purchaseQuery);
    console.log('🛒 Purchase Params:', purchaseParams);

    const purchaseResult = await db.query(purchaseQuery, purchaseParams);

    /* ---------- Transfers In ---------- */
    paramCount = 0;
    let transferInParams = [];
    let transferInQuery = `
      SELECT COALESCE(SUM(t.quantity), 0) as transfers_in
      FROM transfers t
      WHERE t.status = 'completed'
    `;

    if (targetBaseId) {
      transferInQuery += ` AND t.to_base_id = $${++paramCount}`;
      transferInParams.push(targetBaseId);
    }
    if (start_date) {
      transferInQuery += ` AND t.transfer_date >= $${++paramCount}`;
      transferInParams.push(start_date);
    }
    if (end_date) {
      transferInQuery += ` AND t.transfer_date <= $${++paramCount}`;
      transferInParams.push(end_date);
    }

    console.log('📥 Transfer In Query:', transferInQuery);
    console.log('📥 Transfer In Params:', transferInParams);

    const transferInResult = await db.query(transferInQuery, transferInParams);

    /* ---------- Transfers Out ---------- */
    paramCount = 0;
    let transferOutParams = [];
    let transferOutQuery = `
      SELECT COALESCE(SUM(t.quantity), 0) as transfers_out
      FROM transfers t
      WHERE t.status = 'completed'
    `;

    if (targetBaseId) {
      transferOutQuery += ` AND t.from_base_id = $${++paramCount}`;
      transferOutParams.push(targetBaseId);
    }
    if (start_date) {
      transferOutQuery += ` AND t.transfer_date >= $${++paramCount}`;
      transferOutParams.push(start_date);
    }
    if (end_date) {
      transferOutQuery += ` AND t.transfer_date <= $${++paramCount}`;
      transferOutParams.push(end_date);
    }

    console.log('📤 Transfer Out Query:', transferOutQuery);
    console.log('📤 Transfer Out Params:', transferOutParams);

    const transferOutResult = await db.query(transferOutQuery, transferOutParams);

    /* ---------- Closing Balance ---------- */
    let closingQuery = `
      SELECT COUNT(*) as closing_balance
      FROM assets a
      WHERE a.status != 'expended'
    `;
    let closingParams = [];
    paramCount = 0;

    if (targetBaseId) {
      closingQuery += ` AND a.current_base_id = $${++paramCount}`;
      closingParams.push(targetBaseId);
    }

    console.log('📊 Closing Query:', closingQuery);
    console.log('📊 Closing Params:', closingParams);

    const closingResult = await db.query(closingQuery, closingParams);

    /* ---------- Assigned Assets ---------- */
    let assignedQuery = `
      SELECT COUNT(DISTINCT asn.asset_id) as assigned_assets
      FROM assignments asn
      JOIN assets a ON asn.asset_id = a.asset_id
      WHERE asn.status = 'active'
    `;
    let assignedParams = [];
    paramCount = 0;

    if (targetBaseId) {
      assignedQuery += ` AND a.current_base_id = $${++paramCount}`;
      assignedParams.push(targetBaseId);
    }

    console.log('🧾 Assigned Query:', assignedQuery);
    console.log('🧾 Assigned Params:', assignedParams);

    const assignedResult = await db.query(assignedQuery, assignedParams);

    /* ---------- Expended ---------- */
    let expendedQuery = `
      SELECT COALESCE(SUM(e.quantity), 0) as expended
      FROM expenditures e
      WHERE 1=1
    `;
    let expendedParams = [];
    paramCount = 0;

    if (targetBaseId) {
      expendedQuery += ` AND e.base_id = $${++paramCount}`;
      expendedParams.push(targetBaseId);
    }
    if (start_date) {
      expendedQuery += ` AND e.expended_date >= $${++paramCount}`;
      expendedParams.push(start_date);
    }
    if (end_date) {
      expendedQuery += ` AND e.expended_date <= $${++paramCount}`;
      expendedParams.push(end_date);
    }

    console.log('🔥 Expended Query:', expendedQuery);
    console.log('🔥 Expended Params:', expendedParams);

    const expendedResult = await db.query(expendedQuery, expendedParams);

    /* ---------- Final Math ---------- */
    const purchases = parseInt(purchaseResult.rows[0].purchases) || 0;
    const transfersIn = parseInt(transferInResult.rows[0].transfers_in) || 0;
    const transfersOut = parseInt(transferOutResult.rows[0].transfers_out) || 0;
    const expended = parseInt(expendedResult.rows[0].expended) || 0;

    const netMovement = purchases + transfersIn - transfersOut - expended;

    console.log('📈 Final Metrics:', {
      purchases,
      transfersIn,
      transfersOut,
      expended,
      netMovement
    });

    res.json({
      opening_balance: parseInt(openingResult.rows[0].opening_balance) || 0,
      purchases,
      transfers_in: transfersIn,
      transfers_out: transfersOut,
      net_movement: netMovement,
      closing_balance: parseInt(closingResult.rows[0].closing_balance) || 0,
      assigned_assets: parseInt(assignedResult.rows[0].assigned_assets) || 0,
      expended
    });
  } catch (error) {
    console.error('❌ Dashboard metrics error:', error);
    console.error('🧵 Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch dashboard metrics',
      details: error.message
    });
  }
});

/* ================================
   GET /api/dashboard/movement-details
================================ */
router.get('/movement-details', authenticateToken, async (req, res) => {
  console.log('📦 /movement-details route hit');

  const db = req.app.get('db');
  const { base_id, start_date, end_date } = req.query;

  console.log('🔍 Query Params:', req.query);
  console.log('👤 User:', req.user);

  try {
    let targetBaseId = null;

    if (req.user.role !== 'admin') {
      targetBaseId = req.user.base_id;
    } else if (base_id) {
      targetBaseId = parseInt(base_id);
    }

    console.log('🎯 Target Base:', targetBaseId);

    const baseCondition = targetBaseId ? `AND p.base_id = ${targetBaseId}` : '';
    let dateCondition = '';
    if (start_date) dateCondition += ` AND p.purchase_date >= '${start_date}'`;
    if (end_date) dateCondition += ` AND p.purchase_date <= '${end_date}'`;

    console.log('🛒 Purchase Conditions:', baseCondition, dateCondition);

    const purchases = await db.query(`
      SELECT p.purchase_id, p.quantity, p.purchase_date, p.vendor,
             et.type_name, et.category
      FROM purchases p
      JOIN equipment_types et ON p.equipment_type_id = et.type_id
      WHERE 1=1 ${baseCondition} ${dateCondition}
      ORDER BY p.purchase_date DESC
      LIMIT 50
    `);

    let transferInCondition = targetBaseId ? `AND t.to_base_id = ${targetBaseId}` : '';
    let transferDateCondition = '';
    if (start_date) transferDateCondition += ` AND t.transfer_date >= '${start_date}'`;
    if (end_date) transferDateCondition += ` AND t.transfer_date <= '${end_date}'`;

    console.log('📥 Transfer In Conditions:', transferInCondition, transferDateCondition);

    const transfersIn = await db.query(`
      SELECT t.transfer_id, t.quantity, t.transfer_date, t.reason,
             b.base_name as from_base, et.type_name
      FROM transfers t
      JOIN bases b ON t.from_base_id = b.base_id
      JOIN assets a ON t.asset_id = a.asset_id
      JOIN equipment_types et ON a.equipment_type_id = et.type_id
      WHERE t.status = 'completed'
      ${transferInCondition} ${transferDateCondition}
      ORDER BY t.transfer_date DESC
      LIMIT 50
    `);

    let transferOutCondition = targetBaseId ? `AND t.from_base_id = ${targetBaseId}` : '';

    console.log('📤 Transfer Out Condition:', transferOutCondition);

    const transfersOut = await db.query(`
      SELECT t.transfer_id, t.quantity, t.transfer_date, t.reason,
             b.base_name as to_base, et.type_name
      FROM transfers t
      JOIN bases b ON t.to_base_id = b.base_id
      JOIN assets a ON t.asset_id = a.asset_id
      JOIN equipment_types et ON a.equipment_type_id = et.type_id
      WHERE t.status = 'completed'
      ${transferOutCondition} ${transferDateCondition}
      ORDER BY t.transfer_date DESC
      LIMIT 50
    `);

    console.log('✅ Movement details fetched');

    res.json({
      purchases: purchases.rows,
      transfers_in: transfersIn.rows,
      transfers_out: transfersOut.rows
    });
  } catch (error) {
    console.error('❌ Movement details error:', error);
    console.error('🧵 Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch movement details',
      details: error.message
    });
  }
});

export default router;
