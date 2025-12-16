// server.js — FULL ESM ENTRY POINT

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// ================================
// ENV SETUP
// ================================
console.log('[BOOT] Loading environment variables...');
dotenv.config();

console.log('[BOOT] NODE_ENV:', process.env.NODE_ENV);
console.log('[BOOT] FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('[BOOT] DATABASE_URL exists:', !!process.env.DATABASE_URL);

// ================================
// APP INIT
// ================================
console.log('[BOOT] Initializing Express app...');
const app = express();

// ================================
// MIDDLEWARE
// ================================
console.log('[MIDDLEWARE] Registering helmet');
app.use(helmet());

console.log('[MIDDLEWARE] Registering cors');
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })
);

console.log('[MIDDLEWARE] Registering body parsers');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('[MIDDLEWARE] Registering morgan logger');
app.use(morgan('combined'));

// ================================
// DATABASE
// ================================
console.log('[DB] Creating PostgreSQL pool...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
});

console.log('[DB] Pool created');

// Test DB connection
console.log('[DB] Testing database connection...');
pool
  .query('SELECT NOW()')
  .then(res => {
    console.log('[DB] Connected successfully at:', res.rows[0].now);
  })
  .catch(err => {
    console.error('[DB] Connection FAILED:', err);
  });

// Make DB available everywhere
console.log('[DB] Attaching pool to app');
app.set('db', pool);

// ================================
// ROUTES IMPORT
// ================================
console.log('[ROUTES] Importing routes...');

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import purchaseRoutes from './routes/purchases.js';
import transferRoutes from './routes/transfers.js';
import assignmentRoutes from './routes/assignments.js';
import baseRoutes from './routes/bases.js';

console.log('[ROUTES] All routes imported');

// ================================
// ROUTES REGISTER
// ================================
console.log('[ROUTES] Registering routes...');

app.use('/api/auth', authRoutes);
console.log('[ROUTES] /api/auth registered');

app.use('/api/dashboard', dashboardRoutes);
console.log('[ROUTES] /api/dashboard registered');

app.use('/api/purchases', purchaseRoutes);
console.log('[ROUTES] /api/purchases registered');

app.use('/api/transfers', transferRoutes);
console.log('[ROUTES] /api/transfers registered');

app.use('/api/assignments', assignmentRoutes);
console.log('[ROUTES] /api/assignments registered');

app.use('/api/bases', baseRoutes);
console.log('[ROUTES] /api/bases registered');

// ================================
// HEALTH CHECK
// ================================
app.get('/api/health', (req, res) => {
  console.log('[HEALTH] Health check ping');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ================================
// ERROR HANDLER
// ================================
app.use((err, req, res, next) => {
  console.error('[ERROR] Global error handler hit');
  console.error('[ERROR] Message:', err.message);
  console.error('[ERROR] Stack:', err.stack);

  if (req.user) {
    console.log('[ERROR] Logging error to audit_logs for user:', req.user.user_id);

    const logQuery = `
      INSERT INTO audit_logs
      (user_id, action, table_name, record_id, new_values, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    pool
      .query(logQuery, [
        req.user.user_id,
        'ERROR',
        'system',
        null,
        JSON.stringify({
          message: err.message,
          stack: err.stack
        }),
        req.ip
      ])
      .then(() => console.log('[ERROR] Audit log inserted'))
      .catch(logErr =>
        console.error('[ERROR] Audit log FAILED:', logErr)
      );
  } else {
    console.log('[ERROR] No user on request, skipping audit log');
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ================================
// 404 HANDLER
// ================================
app.use((req, res) => {
  console.warn('[404] Route not found:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

// ================================
// SERVER START
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('===================================');
  console.log(`[SERVER] Running on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('===================================');
});
