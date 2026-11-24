const { db } = require('../db.js');

const retrieveAllClinics = async (req, res) => {
  try {
    const [clinics] = await db.query(
      'SELECT * FROM clinics WHERE is_active = TRUE'
    );

    return res.status(200).json({
      results: clinics.length,
      data: clinics
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Database error'
    });
  }
};

const retrieveClinicById = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'Invalid clinic ID'
    });
  }

  try {
    const [clinics] = await db.query(
      'SELECT * FROM clinics WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (clinics.length === 0) {
      return res.status(404).json({
        message: 'Clinic not found'
      });
    }

    return res.status(200).json({
      data: clinics[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Database error'
    });
  }
};

const createClinic = async (req, res) => {
  const { name, address, phone } = req.body || {};

  if (typeof name !== 'string' || !name.trim() ||
      typeof address !== 'string' || !address.trim() ||
      (phone != null && typeof phone !== 'string')) {
    return res.status(400).json({
      message: 'Valid name and address are required'
    });
  }

  if (name.trim().length > 150 ||
      address.trim().length > 255 ||
      (phone && phone.length > 30)) {
    return res.status(400).json({
      message: 'Input exceeds allowed length'
    });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO clinics (name, address, phone) VALUES (?, ?, ?)',
      [name.trim(), address.trim(), phone || null]
    );

    return res.status(201).json({
      message: 'Clinic created successfully',
      id: result.insertId
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Database error'
    });
  }
};

const updateClinic = async (req, res) => {
  const id = Number(req.params.id);
  const { name, address, phone } = req.body || {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'Invalid clinic ID'
    });
  }

  if (typeof name !== 'string' || !name.trim() ||
      typeof address !== 'string' || !address.trim() ||
      (phone != null && typeof phone !== 'string') ||
      name.trim().length > 150 ||
      address.trim().length > 255 ||
      (phone && phone.length > 30)) {
    return res.status(400).json({
      message: 'Invalid clinic information'
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE clinics
       SET name = ?, address = ?, phone = ?
       WHERE id = ? AND is_active = TRUE`,
      [name.trim(), address.trim(), phone || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Clinic not found'
      });
    }

    return res.status(200).json({
      message: 'Clinic updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Database error'
    });
  }
};

const deactivateClinic = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'Invalid clinic ID'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE clinics SET is_active = FALSE WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Clinic not found'
      });
    }

    return res.status(200).json({
      message: 'Clinic deactivated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Database error'
    });
  }
};

module.exports = {
  retrieveAllClinics,
  retrieveClinicById,
  createClinic,
  updateClinic,
  deactivateClinic
};
