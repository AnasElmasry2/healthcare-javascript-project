const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRouter = require('./routes/authRoutes.js');

const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

app.use(cookieParser());

app.use('/api/auth', authRouter);

module.exports = {
  app
};
 