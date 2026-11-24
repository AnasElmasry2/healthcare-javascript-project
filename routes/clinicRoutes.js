 
const express = require('express');

const {
  retrieveAllClinics,
  retrieveClinicById,
  createClinic,
  updateClinic,
  deactivateClinic
} = require('../controllers/clinicController.js');

const {
  verifyToken,
  verifyAdmin
} = require('../middlewares/authMiddlewares.js');

const clinicRouter = express.Router();

clinicRouter.get('/', retrieveAllClinics);
clinicRouter.get('/:id', retrieveClinicById);

clinicRouter.post('/', verifyToken, verifyAdmin, createClinic);
clinicRouter.put('/:id', verifyToken, verifyAdmin, updateClinic);
clinicRouter.delete('/:id', verifyToken, verifyAdmin, deactivateClinic);

module.exports = clinicRouter;
