const DailyProgram = require('../models/DailyProgram');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/program/day/:dayNumber — returns the curriculum content for one
// day, with vocabulary terms populated. This is content, not user data —
// every authenticated user sees the same DailyProgram document for a given
// day number. Per-user progress against it is tracked separately (Phase 3).
const getDay = asyncHandler(async (req, res) => {
  const dayNumber = Number(req.params.dayNumber);

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 90) {
    return res.status(400).json({ error: 'dayNumber must be an integer between 1 and 90' });
  }

  const day = await DailyProgram.findOne({ dayNumber }).populate('vocabularyTermIds');

  if (!day) {
    return res.status(404).json({
      error: `Day ${dayNumber} has not been authored/seeded yet`,
    });
  }

  res.status(200).json({ day });
});

module.exports = { getDay };
