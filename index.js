const express = require('express');
const tripRouter = require('./routes/tripRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const authRouter = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use('/trips', tripRouter);
app.use('/users', userRouter);
app.use('/reviews', reviewRouter);
app.use('/auth', authRouter);


module.exports = { app };