 
const bcrypt = require('bcrypt');
const { db } = require('../db.js');
const signToken = require('../utils/signToken.js');

const {
  sanitizeInput,
  validateRequired,
  validateEmail,
  validatePassword
} = require('../utils/validators.js');

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 1000
};

const logAuthEvent = async (userId, eventType, ip) => {
  try {
    await db.query(
      `INSERT INTO authentication_logs
       (user_id, event_type, ip_address)
       VALUES (?, ?, ?)`,
      [userId, eventType, ip || 'unknown']
    );
  } catch (error) {
    console.error('Authentication logging failed');
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body || {};

  const cleanName = sanitizeInput(name);
  const cleanEmail = sanitizeInput(email).toLowerCase();

  const requiredError = validateRequired(
    { name: cleanName, email: cleanEmail, password },
    ['name', 'email', 'password']
  );

  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  const emailError = validateEmail(cleanEmail);
  if (emailError) {
    return res.status(400).json({ message: emailError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  if (cleanName.length > 120 || cleanEmail.length > 255) {
    return res.status(400).json({
      message: 'Name or email is too long'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO users
       (name, email, password_hash, role)
       VALUES (?, ?, ?, 'patient')`,
      [cleanName, cleanEmail, hashedPassword]
    );

    return res.status(201).json({
      message: 'Patient registered successfully',
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: 'patient'
      }
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Email already exists'
      });
    }

    return res.status(500).json({
      message: 'Registration error'
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = sanitizeInput(email).toLowerCase();

  if (!cleanEmail || typeof password !== 'string' ||
      !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [cleanEmail]
    );

    const user = users[0];

    const isMatch = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !isMatch || user.status !== 'active') {
      await logAuthEvent(
        user ? user.id : null,
        'login_failure',
        req.ip
      );

      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = signToken(user.id, user.role);

    res.cookie('jwt', token, cookieOptions);

    await logAuthEvent(user.id, 'login_success', req.ip);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Login error'
    });
  }
};

const logoutUser = async (req, res) => {
  if (req.user) {
    await logAuthEvent(req.user.id, 'logout', req.ip);
  }

  res.clearCookie('jwt', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });

  return res.status(200).json({
    message: 'Logged out successfully'
  });
};

const getCurrentUser = (req, res) => {
  return res.status(200).json({
    user: req.user
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
};
