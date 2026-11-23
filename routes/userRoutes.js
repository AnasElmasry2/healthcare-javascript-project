
const express = require('express');

const { RetrievAllUsers , getEmployeesandmanagers } = require('../controllers/usercontroller');

const userRouter = express.Router();

userRouter.get('/users', RetrievAllUsers);
userRouter.get('/employees-managers', getEmployeesandmanagers);

module.exports = userRouter;


