const express = require('express');
const router = express.Router();
const db = require('../db');

// Create complaint
router.post('/', async (req, res) => {
  try {
    const { user_id, category, priority, description } = req.body;
    const result = await db.query(
      `INSERT INTO complaints (user_id, category, priority, description, status)
       VALUES ($1, $2, $3, $4, 'open') RETURNING complaint_id`,
      [user_id, category, priority, description]
    );
    const ticketId = result.rows[0].complaint_id;
    res.status(201).json({ ticketId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// List complaints
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM complaints ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Update complaint
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status, assigned_staff, priority } = req.body;
    const result = await db.query(
      `UPDATE complaints SET status = COALESCE($1, status), assigned_staff = COALESCE($2, assigned_staff), priority = COALESCE($3, priority), updated_at = now() WHERE complaint_id = $4 RETURNING *`,
      [status, assigned_staff, priority, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Complaint not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// Escalate complaint
router.post('/escalate/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Insert escalation record and bump escalation level if present
    const tx = await db.pool.connect();
    try {
      await tx.query('BEGIN');
      const escInsert = await tx.query(
        'INSERT INTO escalations (complaint_id, escalation_level, timestamp) VALUES ($1, COALESCE((SELECT max(escalation_level)+1 FROM escalations WHERE complaint_id = $1), 1), now()) RETURNING escalation_level',
        [id]
      );
      await tx.query('UPDATE complaints SET priority = GREATEST(priority - 1, 1) WHERE complaint_id = $1', [id]);
      await tx.query('COMMIT');
      res.json({ escalation_level: escInsert.rows[0].escalation_level });
    } catch (e) {
      await tx.query('ROLLBACK');
      throw e;
    } finally {
      tx.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to escalate complaint' });
  }
});

module.exports = router;
