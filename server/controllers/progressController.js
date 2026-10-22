const { z } = require('zod');

const DailyProgress = require('../models/DailyProgress');
const UserResponse = require('../models/UserResponse');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const geminiService = require('../services/geminiService');

const STAGE_ORDER = [
  'tongueTwister',
  'reading',
  'reflection',
  'speedReading',
  'vocabulary',
  'speaking1',
  'speaking2',
];

const TEXT_STAGES = new Set(['reflection', 'speedReading', 'speaking1', 'speaking2']);

const parseDayNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
    return null;
  }
  return parsed;
};

const ensureAccessToDay = (user, dayNumber) => {
  if (dayNumber > user.currentDay) {
    const lockMessage = `This day is locked. Complete Day ${Math.max(user.currentDay - 1, 1)} first.`;
    const error = new Error(lockMessage);
    error.statusCode = 403;
    throw error;
  }
};

const getNextStage = (stagesCompleted) => {
  for (const stage of STAGE_ORDER) {
    if (!stagesCompleted[stage]) {
      return stage;
    }
  }
  return 'complete';
};

const getProgressDocument = async (userId, dayNumber) => {
  let progress = await DailyProgress.findOne({ userId, dayNumber });

  if (!progress) {
    progress = await DailyProgress.create({
      userId,
      dayNumber,
      stagesCompleted: {
        tongueTwister: false,
        reading: false,
        reflection: false,
        speedReading: false,
        vocabulary: false,
        speaking1: false,
        speaking2: false,
      },
      currentStage: 'tongueTwister',
      dayCompleted: false,
      dayCompletedAt: null,
      dailyScoreSummary: { speedWpm: null },
    });
  }

  return progress;
};

const getDayProgress = asyncHandler(async (req, res) => {
  const dayNumber = parseDayNumber(req.params.dayNumber);

  if (dayNumber === null) {
    return res.status(400).json({ error: 'dayNumber must be an integer between 1 and 90' });
  }

  ensureAccessToDay(req.user, dayNumber);

  const progress = await getProgressDocument(req.user._id, dayNumber);
  const responses = await UserResponse.find({ userId: req.user._id, dayNumber }).sort({ updatedAt: -1 });

  return res.status(200).json({
    progress,
    responses: responses.map((response) => ({
      stage: response.stage,
      responseText: response.responseText,
      metadata: response.metadata,
      aiEvaluation: response.aiEvaluation,
      updatedAt: response.updatedAt,
    })),
  });
});

const getProgressSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [completedDaysCount, recentProgress] = await Promise.all([
    DailyProgress.countDocuments({ userId, dayCompleted: true }),
    DailyProgress.find({ userId, dayCompleted: true })
      .sort({ dayCompletedAt: -1 })
      .limit(5)
      .select('dayNumber dailyScoreSummary dayCompletedAt')
      .lean(),
  ]);

  return res.status(200).json({
    currentDay: req.user.currentDay,
    completedDaysCount,
    percentComplete: Math.round((completedDaysCount / 90) * 100),
    streak: req.user.streak,
    recentProgress: recentProgress.map((entry) => ({
      dayNumber: entry.dayNumber,
      dailyScoreSummary: entry.dailyScoreSummary,
      dayCompletedAt: entry.dayCompletedAt,
    })),
  });
});

const saveStage = asyncHandler(async (req, res) => {
  const { dayNumber, stage, responseText, wpm, durationSeconds } = req.body;

  ensureAccessToDay(req.user, dayNumber);

  if (!TEXT_STAGES.has(stage) && responseText !== undefined) {
    // no-op; non-text stages ignore body text
  }

  let aiEvaluation = null;

  if (TEXT_STAGES.has(stage)) {
    const trimmed = typeof responseText === 'string' ? responseText.trim() : '';
    if (!trimmed || trimmed.length > 10000) {
      return res.status(400).json({
        error: 'Response must be between 1 and 10000 characters',
      });
    }

    const savedResponse = await UserResponse.findOneAndUpdate(
      { userId: req.user._id, dayNumber, stage },
      {
        userId: req.user._id,
        dayNumber,
        stage,
        responseText: trimmed,
        metadata: {
          wpm: wpm ?? null,
          durationSeconds: durationSeconds ?? null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    aiEvaluation = await geminiService.evaluateResponse({
      stage,
      dayNumber,
      responseText: trimmed,
      userName: req.user.name,
      professionalContext: req.user.professionalContext,
    });

    savedResponse.aiEvaluation = aiEvaluation;
    await savedResponse.save();
  }

  const progress = await getProgressDocument(req.user._id, dayNumber);

  if (stage === 'speedReading' && typeof wpm === 'number') {
    progress.dailyScoreSummary = progress.dailyScoreSummary || {};
    progress.dailyScoreSummary.speedWpm = Number(wpm);
  }

  progress.stagesCompleted[stage] = true;
  progress.currentStage = getNextStage(progress.stagesCompleted);
  await progress.save();

  return res.status(200).json({ progress, aiEvaluation });
});

const completeDay = asyncHandler(async (req, res) => {
  const { dayNumber } = req.body;

  ensureAccessToDay(req.user, dayNumber);

  const progress = await getProgressDocument(req.user._id, dayNumber);
  const allStagesDone = STAGE_ORDER.every((stage) => progress.stagesCompleted[stage]);

  if (!allStagesDone) {
    return res.status(400).json({ error: 'This day is not complete yet.' });
  }

  progress.dayCompleted = true;
  progress.dayCompletedAt = new Date();
  progress.currentStage = 'complete';
  await progress.save();

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (dayNumber >= user.currentDay && user.currentDay < 90) {
    user.currentDay = dayNumber + 1;
  }
  user.lastActiveDate = new Date();
  await user.save();

  return res.status(200).json({ progress, user: user.toSafeObject() });
});

module.exports = {
  getProgressSummary,
  getDayProgress,
  saveStage,
  completeDay,
};
