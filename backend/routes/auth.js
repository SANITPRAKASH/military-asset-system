// routes/auth.js - Authentication routes
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/* =========================
   LOGIN
========================= */
router.post('/login', async (req, res) => {
  console.log('🟡 [LOGIN] Route hit');
  console.log('🟡 [LOGIN] Request body:', req.body);

  const db = req.app.get('db');
  const { username, password } = req.body;

  if (!username || !password) {
    console.log('🔴 [LOGIN] Missing username or password');
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    console.log('🟡 [LOGIN] Fetching user from DB');

    const userResult = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    console.log('🟡 [LOGIN] DB result count:', userResult.rows.length);

    if (userResult.rows.length === 0) {
      console.log('🔴 [LOGIN] User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    console.log('🟡 [LOGIN] User found:', {
      user_id: user.user_id,
      username: user.username,
      role: user.role
    });

    console.log('🟡 [LOGIN] Comparing passwords');
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      console.log('🔴 [LOGIN] Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('🟢 [LOGIN] Password verified');

    console.log('🟡 [LOGIN] Generating JWT');
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        base_id: user.base_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('🟡 [LOGIN] Writing audit log');
    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, ip_address, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.user_id, 'LOGIN', 'users', req.ip, JSON.stringify({ username })]
    );

    console.log('🟢 [LOGIN] Success');

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        base_id: user.base_id
      }
    });
  } catch (error) {
    console.log('🔴 [LOGIN] Exception:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

/* =========================
   REGISTER
========================= */
router.post('/register', async (req, res) => {
  console.log('🟡 [REGISTER] Route hit');
  console.log('🟡 [REGISTER] Request body:', req.body);

  const db = req.app.get('db');
  const { username, password, role, base_id } = req.body;

  if (!username || !password || !role) {
    console.log('🔴 [REGISTER] Missing required fields');
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  const validRoles = ['admin', 'base_commander', 'logistics_officer'];
  if (!validRoles.includes(role)) {
    console.log('🔴 [REGISTER] Invalid role:', role);
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    console.log('🟡 [REGISTER] Checking existing user');

    const existingUser = await db.query(
      'SELECT user_id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log('🔴 [REGISTER] Username already exists');
      return res.status(409).json({ error: 'Username already exists' });
    }

    console.log('🟡 [REGISTER] Hashing password');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('🟡 [REGISTER] Inserting new user');
    const result = await db.query(
      `INSERT INTO users (username, password_hash, role, base_id)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, role, base_id`,
      [username, passwordHash, role, base_id || null]
    );

    const newUser = result.rows[0];
    console.log('🟢 [REGISTER] User created:', newUser);

    console.log('🟡 [REGISTER] Writing audit log');
    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, ip_address, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [newUser.user_id, 'REGISTER', 'users', req.ip, JSON.stringify({ username, role })]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    console.log('🔴 [REGISTER] Exception:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/* =========================
   GET CURRENT USER
========================= */
router.get('/me', authenticateToken, async (req, res) => {
  console.log('🟡 [ME] Route hit');
  console.log('🟡 [ME] Auth user:', req.user);

  const db = req.app.get('db');

  try {
    console.log('🟡 [ME] Fetching user profile from DB');

    const result = await db.query(
      `SELECT u.user_id, u.username, u.role, u.base_id, b.base_name
       FROM users u
       LEFT JOIN bases b ON u.base_id = b.base_id
       WHERE u.user_id = $1`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      console.log('🔴 [ME] User not found in DB');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('🟢 [ME] User data sent');
    res.json(result.rows[0]);
  } catch (error) {
    console.log('🔴 [ME] Exception:', error.message);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

/* =========================
   LOGOUT
========================= */
router.post('/logout', authenticateToken, async (req, res) => {
  console.log('🟡 [LOGOUT] Route hit');
  console.log('🟡 [LOGOUT] User:', req.user);

  const db = req.app.get('db');

  try {
    console.log('🟡 [LOGOUT] Writing audit log');

    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [req.user.user_id, 'LOGOUT', 'users', req.ip]
    );

    console.log('🟢 [LOGOUT] Success');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.log('🔴 [LOGOUT] Exception:', error.message);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
