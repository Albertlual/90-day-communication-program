const mongoose = require('mongoose');

const STAGE_KEYS = [
  'tongueTwister',
  'reading',
  'reflection',
  'speedReading',
  'vocabulary',
  'speaking1',
  'speaking2',
];

const dailyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 90,
    },
    stagesCompleted: {
      type: {
        tongueTwister: { type: Boolean, default: false },
        reading: { type: Boolean, default: false },
        reflection: { type: Boolean, default: false },
        speedReading: { type: Boolean, default: false },
        vocabulary: { type: Boolean, default: false },
        speaking1: { type: Boolean, default: false },
        speaking2: { type: Boolean, default: false },
      },
      default: () => ({
        tongueTwister: false,
        reading: false,
        reflection: false,
        speedReading: false,
        vocabulary: false,
        speaking1: false,
        speaking2: false,
      }),
    },
    currentStage: {
      type: String,
      enum: [...STAGE_KEYS, 'complete'],
      default: 'tongueTwister',
    },
    dayCompleted: {
      type: Boolean,
      default: false,
    },
    dayCompletedAt: {
      type: Date,
      default: null,
    },
    dailyScoreSummary: {
      speedWpm: {
        type: Number,
        default: null,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

dailyProgressSchema.index({ userId: 1, dayNumber: 1 }, { unique: true });

dailyProgressSchema.statics.STAGE_KEYS = STAGE_KEYS;

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
