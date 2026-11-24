const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many requests from this IP, please try again later.'
});


app.use(express.json());

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

app.use(cookieParser());
app.use(limiter);

module.exports = {
  app,
};