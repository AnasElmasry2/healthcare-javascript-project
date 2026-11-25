const { db } = require('../db.js');

const validId = (id) =>
  Number.isSafeInteger(Number(id)) && Number(id) > 0;

const retrieveAllSpecialties = async (req, res) => {
  try {
    const [specialties] = await db.query(
      'SELECT * FROM specialties ORDER BY name'
    );
    return res.status(200).json({
      results: specialties.length,
      data: specialties
    });
  } catch (error) {
    return res.status(500).json({ message: 'Database error' });
  }
};

const retrieveSpecialtyById = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid specialty ID' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM specialties WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Specialty not found' });
    }
    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Database error' });
  }
};

const createSpecialty = async (req, res) => {
  const { name, description } = req.body || {};

  if (typeof name !== 'string' || !name.trim() ||
      name.trim().length > 100 ||
      (description != null && typeof description !== 'string')) {
    return res.status(400).json({
      message: 'Valid specialty name and description required'
    });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO specialties (name, description) VALUES (?, ?)',
      [name.trim(), description || null]
    );
    return res.status(201).json({
      message: 'Specialty created successfully',
      id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Specialty already exists'
      });
    }
    return res.status(500).json({ message: 'Database error' });
  }
};

const updateSpecialty = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid specialty ID' });
  }

  const { name, description } = req.body || {};
  if (typeof name !== 'string' || !name.trim() ||
      name.trim().length > 100 ||
      (description != null && typeof description !== 'string')) {
    return res.status(400).json({
      message: 'Invalid specialty information'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE specialties SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Specialty not found' });
    }
    return res.status(200).json({
      message: 'Specialty updated successfully'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Specialty already exists'
      });
    }
    return res.status(500).json({ message: 'Database error' });
  }
};

module.exports = {
  retrieveAllSpecialties,
  retrieveSpecialtyById,
  createSpecialty,
  updateSpecialty
};
