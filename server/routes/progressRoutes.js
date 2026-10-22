const express = require('express');
const { z } = require('zod');

const progressController = require('../controllers/progressController');
const requireAuth = require('../middleware/requireAuth');
const validateRequest = require('../middleware/validateRequest');

const stageSchema = z.enum([
  'tongueTwister',
  'reading',
  'reflection',
  'speedReading',
  'vocabulary',
  'speaking1',
  'speaking2',
]);

const stageBodySchema = z.object({
  dayNumber: z.number().int().min(1).max(90),
  stage: stageSchema,
  responseText: z.string().trim().max(10000).optional(),
  wpm: z.number().positive().max(10000).optional(),
  durationSeconds: z.number().int().min(1).max(86400).optional(),
});

const completeDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(90),
});

const router = express.Router();

router.get('/', requireAuth, progressController.getProgressSummary);
router.get('/day/:dayNumber', requireAuth, progressController.getDayProgress);
router.post('/stage', requireAuth, validateRequest(stageBodySchema), progressController.saveStage);
router.post('/complete-day', requireAuth, validateRequest(completeDaySchema), progressController.completeDay);

module.exports = router;
