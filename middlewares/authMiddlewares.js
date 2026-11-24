const jwt = require('jsonwebtoken');
const { db } = require('../db.js');

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const [users] = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0 ||
        users[0].status !== 'active') {
      return res.status(401).json({
        message: 'Account unavailable'
      });
    }

    req.user = users[0];
    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied: admin only'
    });
  }

  next();
};

module.exports = {
  verifyToken,
  verifyAdmin
};
  