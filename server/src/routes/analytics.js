const express = require('express');
const router = express.Router();
const db = require('../db');

// Basic analytics: counts by status and category
router.get('/', async (req, res) => {
  try {
    const byStatus = await db.query('SELECT status, count(*) FROM complaints GROUP BY status');
    const byCategory = await db.query('SELECT category, count(*) FROM complaints GROUP BY category');
    res.json({ byStatus: byStatus.rows, byCategory: byCategory.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
