const mongoose = require('mongoose');

const userResponseSchema = new mongoose.Schema(
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
    stage: {
      type: String,
      required: true,
      enum: ['reflection', 'speedReading', 'speaking1', 'speaking2'],
    },
    responseText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    metadata: {
      wpm: { type: Number, default: null, min: 0 },
      durationSeconds: { type: Number, default: null, min: 1 },
    },
    aiEvaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

userResponseSchema.index({ userId: 1, dayNumber: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model('UserResponse', userResponseSchema);
