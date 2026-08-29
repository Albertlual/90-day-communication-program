const express = require('express');

const programController = require('../controllers/programController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/day/:dayNumber', requireAuth, programController.getDay);

module.exports = router;
