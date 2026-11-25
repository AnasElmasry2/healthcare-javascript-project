
const express = require('express');

const {
  retrieveAllDoctors,
  retrieveDoctorById,
  createDoctor,
  updateDoctor,
  deactivateDoctor,
  assignDoctorToClinic,
  removeDoctorFromClinic
} = require('../controllers/doctorController.js');

const {
  verifyToken,
  verifyAdmin
} = require('../middlewares/authMiddlewares.js');

const doctorRouter = express.Router();

doctorRouter.get('/', retrieveAllDoctors);
doctorRouter.get('/:id', retrieveDoctorById);

doctorRouter.post('/', verifyToken, verifyAdmin, createDoctor);
doctorRouter.put('/:id', verifyToken, verifyAdmin, updateDoctor);
doctorRouter.delete('/:id', verifyToken, verifyAdmin, deactivateDoctor);

doctorRouter.post(
  '/:id/clinics',
  verifyToken,
  verifyAdmin,
  assignDoctorToClinic
);

doctorRouter.delete(
  '/:id/clinics/:clinicId',
  verifyToken,
  verifyAdmin,
  removeDoctorFromClinic
);

module.exports = doctorRouter;
