const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../middleware/auth');

// Helper: load user + primary auth identity + accepted roles by email
async function getUserWithIdentityByEmail(email) {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.user_type,
      u.subtype,
      ai.id AS identity_id,
      ai.password_hash,
      GROUP_CONCAT(DISTINCT r.subtype SEPARATOR ',') AS roles
    FROM users u
    JOIN auth_identities ai
      ON ai.user_id = u.id AND ai.is_primary = TRUE
    LEFT JOIN user_roles ur
      ON ur.owner_user_id = u.id AND ur.status = 'ACCEPTED'
    LEFT JOIN users r
      ON r.id = ur.role_user_id
    WHERE ai.email = ?
    GROUP BY u.id, ai.id;
  `;

  const [rows] = await db.query(sql, [email]);
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

// Helper: load user + identity + roles by user id
async function getUserWithIdentityById(userId) {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.user_type,
      u.subtype,
      ai.id AS identity_id,
      GROUP_CONCAT(DISTINCT r.subtype SEPARATOR ',') AS roles
    FROM users u
    JOIN auth_identities ai
      ON ai.user_id = u.id AND ai.is_primary = TRUE
    LEFT JOIN user_roles ur
      ON ur.owner_user_id = u.id AND ur.status = 'ACCEPTED'
    LEFT JOIN users r
      ON r.id = ur.role_user_id
    WHERE u.id = ?
    GROUP BY u.id, ai.id;
  `;

  const [rows] = await db.query(sql, [userId]);
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body; // phoneNumber is treated as identifier (email) per current schema

  try {
    const user = await getUserWithIdentityByEmail(phoneNumber);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ success: false, message: 'Password not set for this account' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const roles = user.roles || '';
    const tokenPayload = {
      id: user.id,
      name: user.name,
      phone: null,
      role: roles,
      email: user.email
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || null;

    // Create a user session
    let sessionId = null;
    try {
      const insertSessionSql = `
        INSERT INTO user_sessions
          (user_id, identity_id, device_type, device_id, ip_address, user_agent, login_at, logout_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NULL, TRUE);
      `;
      const [sessionResult] = await db.query(insertSessionSql, [
        user.id,
        user.identity_id,
        null,
        null,
        ipAddress,
        userAgent
      ]);
      sessionId = sessionResult.insertId;
    } catch (e) {
      console.error('Error creating user session:', e);
    }

    // Store refresh token in auth_tokens (best-effort)
    try {
      if (sessionId) {
        const storeTokenSql = `
          INSERT INTO auth_tokens
            (user_id, session_id, token_type, token_hash, expires_at, revoked, created_at)
          VALUES (?, ?, 'REFRESH', ?, DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, NOW());
        `;
        await db.query(storeTokenSql, [user.id, sessionId, refreshToken]);
      }
    } catch (e) {
      console.error('Error storing refresh token in auth_tokens:', e);
    }

    // Login history (best-effort)
    try {
      if (sessionId) {
        const loginHistorySql = `
          INSERT INTO login_history
            (user_id, identity_id, session_id, login_method, status, failure_reason, ip_address, user_agent, occurred_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW());
        `;
        await db.query(loginHistorySql, [
          user.id,
          user.identity_id,
          sessionId,
          'PASSWORD',
          'SUCCESS',
          null,
          ipAddress,
          userAgent
        ]);
      }
    } catch (e) {
      console.error('Error storing login history:', e);
    }

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: null,
          role: roles,
          email: user.email
        },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists and is valid in auth_tokens
    const checkTokenSql = `
      SELECT *
      FROM auth_tokens
      WHERE token_type = 'REFRESH'
        AND token_hash = ?
        AND user_id = ?
        AND revoked = FALSE
        AND expires_at > NOW()
      LIMIT 1;
    `;
    try {
      const [results] = await db.query(checkTokenSql, [refreshToken, decoded.userId]);
      if (!results || results.length === 0) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      const tokenRow = results[0];

      // Load user + roles
      const user = await getUserWithIdentityById(decoded.userId);
      if (!user) {
        return res.status(500).json({ success: false, message: 'User not found' });
      }

      const roles = user.roles || '';
      const tokenPayload = {
        id: user.id,
        name: user.name,
        phone: null,
        role: roles,
        email: user.email
      };
      const accessToken = generateToken(tokenPayload);
      return res.json({ success: true, data: { accessToken } });
    } catch (err) {
      console.error('Database error (refresh token):', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded) {
          // Find matching auth_tokens rows
          const [tokens] = await db.query(
            `SELECT * FROM auth_tokens WHERE token_type = 'REFRESH' AND token_hash = ? AND user_id = ?`,
            [refreshToken, decoded.userId]
          );

          // Revoke tokens and close sessions (best-effort)
          for (const t of tokens) {
            try {
              await db.query(
                `UPDATE auth_tokens SET revoked = TRUE WHERE id = ?`,
                [t.id]
              );
              await db.query(
                `UPDATE user_sessions SET is_active = FALSE, logout_at = NOW() WHERE id = ?`,
                [t.session_id]
              );
            } catch (e) {
              console.error('Error revoking token or closing session:', e);
            }
          }
        }
      } catch (e) {
        console.error('Error processing logout token:', e);
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.googleLogin = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await getUserWithIdentityByEmail(email);
    if (!user) {
      return res.json({ success: false, message: 'User does not exist. Please contact owner.' });
    }

    const roles = user.roles || '';
    const tokenPayload = {
      id: user.id,
      name: user.name,
      phone: null,
      role: roles,
      email: user.email
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || null;

    // Create user session
    let sessionId = null;
    try {
      const insertSessionSql = `
        INSERT INTO user_sessions
          (user_id, identity_id, device_type, device_id, ip_address, user_agent, login_at, logout_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NULL, TRUE);
      `;
      const [sessionResult] = await db.query(insertSessionSql, [
        user.id,
        user.identity_id,
        null,
        null,
        ipAddress,
        userAgent
      ]);
      sessionId = sessionResult.insertId;
    } catch (e) {
      console.error('Error creating user session (Google):', e);
    }

    // Store refresh token
    try {
      if (sessionId) {
        const storeTokenSql = `
          INSERT INTO auth_tokens
            (user_id, session_id, token_type, token_hash, expires_at, revoked, created_at)
          VALUES (?, ?, 'REFRESH', ?, DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, NOW());
        `;
        await db.query(storeTokenSql, [user.id, sessionId, refreshToken]);
      }
    } catch (e) {
      console.error('Error storing refresh token (Google):', e);
    }

    // Login history
    try {
      if (sessionId) {
        const loginHistorySql = `
          INSERT INTO login_history
            (user_id, identity_id, session_id, login_method, status, failure_reason, ip_address, user_agent, occurred_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW());
        `;
        await db.query(loginHistorySql, [
          user.id,
          user.identity_id,
          sessionId,
          'GOOGLE',
          'SUCCESS',
          null,
          ipAddress,
          userAgent
        ]);
      }
    } catch (e) {
      console.error('Error storing login history (Google):', e);
    }

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: null,
          role: roles,
          email: user.email
        },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get current authenticated user's profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await getUserWithIdentityById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const roles = user.roles || '';

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: null,
          role: roles,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};