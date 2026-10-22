const express = require('express');
const { z } = require('zod');

const geminiService = require('../services/geminiService');
const requireAuth = require('../middleware/requireAuth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const evaluateSchema = z.object({
  stage: z.enum(['reflection', 'speedReading', 'speaking1', 'speaking2']),
  dayNumber: z.number().int().min(1).max(90),
  responseText: z.string().trim().min(1).max(10000),
});

router.post('/evaluate', requireAuth, validateRequest(evaluateSchema), async (req, res) => {
  const result = await geminiService.evaluateResponse({
    stage: req.body.stage,
    dayNumber: req.body.dayNumber,
    responseText: req.body.responseText,
    userName: req.user.name,
    professionalContext: req.user.professionalContext,
  });

  res.status(200).json({ evaluation: result });
});

module.exports = router;
