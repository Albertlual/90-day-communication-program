const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/health — used as Render's health check path, and for manual checks.
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected

  res.status(200).json({
    status: 'ok',
    db: dbState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
