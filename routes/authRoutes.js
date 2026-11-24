const express = require('express');
const rateLimit = require('express-rate-limit');

const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
} = require('../controllers/authController.js');

const {
  verifyToken
} = require('../middlewares/authMiddlewares.js');
const authRouter = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Try again later.'
});

authRouter.post('/register', registerUser);
authRouter.post('/login', loginLimiter, loginUser);
authRouter.post('/logout', verifyToken, logoutUser);
authRouter.get('/me', verifyToken, getCurrentUser);

module.exports = authRouter; 
