
const express = require('express');

const { RetrievAllUsers , getEmployeesandmanagers } = require('../controllers/user controller');

const router = express.Router();

userRouter.get('/users', RetrievAllUsers);
userRouter.get('/employees-managers', getEmployeesandmanagers);

module.exports = userRouter;


