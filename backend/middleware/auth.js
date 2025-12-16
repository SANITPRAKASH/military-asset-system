// middleware/auth.js - Authentication and Authorization
import jwt from 'jsonwebtoken';

// Verify JWT token
export const authenticateToken = (req, res, next) => {
  console.log('🟡 [AUTH] authenticateToken triggered');

  const authHeader = req.headers['authorization'];
  console.log('🟡 [AUTH] Authorization Header:', authHeader);

  const token = authHeader && authHeader.split(' ')[1];
  console.log('🟡 [AUTH] Extracted Token:', token);

  if (!token) {
    console.log('🔴 [AUTH] No token found');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('🔴 [AUTH] Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    console.log('🟢 [AUTH] Token verified. User:', user);
    req.user = user;
    next();
  });
};

// Role-based access control
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('🟡 [RBAC] authorizeRoles triggered');
    console.log('🟡 [RBAC] Allowed Roles:', allowedRoles);
    console.log('🟡 [RBAC] Current User:', req.user);

    if (!req.user) {
      console.log('🔴 [RBAC] No user found on request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(
        `🔴 [RBAC] Access denied. UserRole=${req.user.role}, Required=${allowedRoles}`
      );
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        requiredRole: allowedRoles,
        userRole: req.user.role
      });
    }

    console.log('🟢 [RBAC] Role authorized');
    next();
  };
};

// Check if user has access to specific base
export const checkBaseAccess = async (req, res, next) => {
  console.log('🟡 [BASE] checkBaseAccess triggered');

  const db = req.app.get('db');
  const requestedBaseId = parseInt(req.params.baseId || req.body.base_id);

  console.log('🟡 [BASE] Requested Base ID:', requestedBaseId);
  console.log('🟡 [BASE] User Info:', req.user);

  if (req.user.role === 'admin') {
    console.log('🟢 [BASE] Admin access granted');
    return next();
  }

  if (req.user.role === 'base_commander') {
    console.log('🟡 [BASE] Base Commander check');
    if (req.user.base_id !== requestedBaseId) {
      console.log(
        `🔴 [BASE] Commander denied. UserBase=${req.user.base_id}, Requested=${requestedBaseId}`
      );
      return res.status(403).json({ error: 'Access denied to this base' });
    }
  }

  if (req.user.role === 'logistics_officer') {
    console.log('🟡 [BASE] Logistics Officer check');
    try {
      const result = await db.query(
        'SELECT base_id FROM users WHERE user_id = $1',
        [req.user.user_id]
      );

      console.log('🟡 [BASE] DB Base ID:', result.rows[0]?.base_id);

      if (result.rows[0].base_id !== requestedBaseId) {
        console.log('🔴 [BASE] Logistics officer denied');
        return res.status(403).json({ error: 'Access denied to this base' });
      }
    } catch (error) {
      console.log('🔴 [BASE] DB error while checking base access:', error.message);
      return res.status(500).json({ error: 'Error checking base access' });
    }
  }

  console.log('🟢 [BASE] Base access granted');
  next();
};

// Audit logging middleware
export const auditLog = (action, tableName) => {
  return async (req, res, next) => {
    console.log('🟡 [AUDIT] auditLog middleware triggered');
    console.log('🟡 [AUDIT] Action:', action);
    console.log('🟡 [AUDIT] Table:', tableName);

    const db = req.app.get('db');
    const originalJson = res.json;

    res.json = function (data) {
      console.log('🟡 [AUDIT] Response sent with status:', res.statusCode);

      if (res.statusCode < 400) {
        console.log('🟢 [AUDIT] Logging audit entry');

        const logQuery = `
          INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        db.query(logQuery, [
          req.user?.user_id || null,
          action,
          tableName,
          data?.id || null,
          JSON.stringify({ body: req.body, params: req.params }),
          req.ip
        ]).catch(err =>
          console.log('🔴 [AUDIT] Audit log failed:', err.message)
        );
      } else {
        console.log('🟡 [AUDIT] Skipping audit log (non-success response)');
      }

      originalJson.call(this, data);
    };

    next();
  };
};
