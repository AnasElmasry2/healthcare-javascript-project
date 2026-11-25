const express = require('express');

const {
  retrieveAllSpecialties,
  retrieveSpecialtyById,
  createSpecialty,
  updateSpecialty
} = require('../controllers/specialtyController.js');

const {
  verifyToken,
  verifyAdmin
} = require('../middlewares/authMiddlewares.js');

const specialtyRouter = express.Router();

specialtyRouter.get('/', retrieveAllSpecialties);
specialtyRouter.get('/:id', retrieveSpecialtyById);

specialtyRouter.post('/', verifyToken, verifyAdmin, createSpecialty);
specialtyRouter.put('/:id', verifyToken, verifyAdmin, updateSpecialty);

module.exports = specialtyRouter;
