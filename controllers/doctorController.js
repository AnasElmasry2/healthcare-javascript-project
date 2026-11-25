
const { db } = require('../db.js');

const validId = (id) =>
  Number.isSafeInteger(Number(id)) && Number(id) > 0;

const retrieveAllDoctors = async (req, res) => {
  const { specialtyId, clinicId } = req.query;

  if ((specialtyId !== undefined && !validId(specialtyId)) ||
      (clinicId !== undefined && !validId(clinicId))) {
    return res.status(400).json({ message: 'Invalid search filter' });
  }

  let sql = `
    SELECT DISTINCT d.id, d.name, d.specialty_id,
           s.name AS specialty_name, d.bio, d.is_active
    FROM doctors d
    JOIN specialties s ON d.specialty_id = s.id
    WHERE d.is_active = TRUE
  `;
  const values = [];

  if (specialtyId !== undefined) {
    sql += ' AND d.specialty_id = ?';
    values.push(specialtyId);
  }

  if (clinicId !== undefined) {
    sql += `
      AND EXISTS (
        SELECT 1 FROM doctor_clinics dc
        JOIN clinics c ON dc.clinic_id = c.id
        WHERE dc.doctor_id = d.id
        AND dc.clinic_id = ?
        AND c.is_active = TRUE
      )
    `;
    values.push(clinicId);
  }

  sql += ' ORDER BY d.name';

  try {
    const [doctors] = await db.query(sql, values);
    return res.status(200).json({
      results: doctors.length,
      data: doctors
    });
  } catch (error) {
    return res.status(500).json({ message: 'Database error' });
  }
};

const retrieveDoctorById = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid doctor ID' });
  }

  try {
    const [doctors] = await db.query(
      `SELECT d.id, d.name, d.specialty_id,
              s.name AS specialty_name, d.bio
       FROM doctors d
       JOIN specialties s ON d.specialty_id = s.id
       WHERE d.id = ? AND d.is_active = TRUE`,
      [req.params.id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const [clinics] = await db.query(
      `SELECT c.id, c.name, c.address, c.phone
       FROM clinics c
       JOIN doctor_clinics dc ON c.id = dc.clinic_id
       WHERE dc.doctor_id = ? AND c.is_active = TRUE`,
      [req.params.id]
    );

    return res.status(200).json({
      data: { ...doctors[0], clinics }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Database error' });
  }
};

const createDoctor = async (req, res) => {
  const { name, specialty_id, bio } = req.body || {};

  if (typeof name !== 'string' || !name.trim() ||
      name.trim().length > 120 || !validId(specialty_id) ||
      (bio != null && typeof bio !== 'string')) {
    return res.status(400).json({
      message: 'Valid doctor name and specialty ID required'
    });
  }

  try {
    const [specialties] = await db.query(
      'SELECT id FROM specialties WHERE id = ?',
      [specialty_id]
    );

    if (specialties.length === 0) {
      return res.status(404).json({ message: 'Specialty not found' });
    }

    const [result] = await db.query(
      'INSERT INTO doctors (name, specialty_id, bio) VALUES (?, ?, ?)',
      [name.trim(), specialty_id, bio || null]
    );

    return res.status(201).json({
      message: 'Doctor created successfully',
      id: result.insertId
    });
  } catch (error) {
    return res.status(500).json({ message: 'Database error' });
  }
};

const updateDoctor = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid doctor ID' });
  }

  const { name, specialty_id, bio } = req.body || {};

  if (typeof name !== 'string' || !name.trim() ||
      name.trim().length > 120 || !validId(specialty_id) ||
      (bio != null && typeof bio !== 'string')) {
    return res.status(400).json({
      message: 'Invalid doctor information'
    });
  }

  try {
    const [specialties] = await db.query(
      'SELECT id FROM specialties WHERE id = ?',
      [specialty_id]
    );

    if (specialties.length === 0) {
      return res.status(404).json({ message: 'Specialty not found' });
    }

    const [result] = await db.query(
      `UPDATE doctors SET name = ?, specialty_id = ?, bio = ?
       WHERE id = ? AND is_active = TRUE`,
      [name.trim(), specialty_id, bio || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.status(200).json({
      message: 'Doctor updated successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Database error' });
  }
};

const deactivateDoctor = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid doctor ID' });
  }

  try {
    const [result] = await db.query(
      'UPDATE doctors SET is_active = FALSE WHERE id = ? AND is_active = TRUE',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.status(200).json({
      message: 'Doctor deactivated successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Database error' });
  }
};

const assignDoctorToClinic = async (req, res) => {
  const doctorId = req.params.id;
  const { clinic_id } = req.body || {};

  if (!validId(doctorId) || !validId(clinic_id)) {
    return res.status(400).json({
      message: 'Valid doctor and clinic IDs required'
    });
  }

  try {
    const [doctors] = await db.query(
      'SELECT id FROM doctors WHERE id = ? AND is_active = TRUE',
      [doctorId]
    );
    const [clinics] = await db.query(
      'SELECT id FROM clinics WHERE id = ? AND is_active = TRUE',
      [clinic_id]
    );

    if (!doctors.length || !clinics.length) {
      return res.status(404).json({
        message: 'Active doctor or clinic not found'
      });
    }

    const [result] = await db.query(
      'INSERT INTO doctor_clinics (doctor_id, clinic_id) VALUES (?, ?)',
      [doctorId, clinic_id]
    );

    return res.status(201).json({
      message: 'Doctor assigned to clinic successfully',
      id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Doctor already assigned to this clinic'
      });
    }
    return res.status(500).json({ message: 'Database error' });
  }
};

const removeDoctorFromClinic = async (req, res) => {
  const { id, clinicId } = req.params;

  if (!validId(id) || !validId(clinicId)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM doctor_clinics WHERE doctor_id = ? AND clinic_id = ?',
      [id, clinicId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    return res.status(200).json({
      message: 'Doctor removed from clinic successfully'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'Cannot remove assignment with related schedules or appointments'
      });
    }
    return res.status(500).json({ message: 'Database error' });
  }
};

module.exports = {
  retrieveAllDoctors,
  retrieveDoctorById,
  createDoctor,
  updateDoctor,
  deactivateDoctor,
  assignDoctorToClinic,
  removeDoctorFromClinic
};
