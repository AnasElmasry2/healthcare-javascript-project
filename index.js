const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRouter = require('./routes/authRoutes.js');
const clinicRouter = require('./routes/clinicRoutes.js');
const specialtyRouter = require('./routes/specialtyRoutes.js');
const doctorRouter = require('./routes/doctorRoutes.js');


const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/clinics', clinicRouter); 
app.use('/api/specialties', specialtyRouter);
app.use('/api/doctors', doctorRouter);

module.exports = {
  app
};
 