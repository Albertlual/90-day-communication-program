const mongoose = require('mongoose');

// One document per day (1–90). This is curriculum content, not user data —
// populated by server/scripts/seedCurriculum.js from the JSON files in
// server/data/curriculum/days/. See CURRICULUM_MAP.md for the structural
// rules every day follows.

const tongueTwisterSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    difficulty: { type: String, required: true }, // e.g. "beginner", "intermediate", "advanced"
    focusSound: { type: String, required: true },
    repetitionTarget: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const readingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, default: null },
    sourceType: {
      type: String,
      required: true,
      enum: ['public-domain', 'licensed-excerpt', 'summary', 'user-provided', 'original'],
      // 'original' = written specifically for this program (the default for
      // Batch 1) — the safest option copyright-wise, added to the blueprint's
      // original enum for exactly that reason.
    },
    content: { type: String, required: true },
    estimatedMinutes: { type: Number, required: true, min: 1 },
    keyConcepts: { type: [String], default: [] },
  },
  { _id: false }
);

const speedReadingSchema = new mongoose.Schema(
  {
    passage: { type: String, required: true },
    wordCount: { type: Number, required: true, min: 1 },
    comprehensionQuestions: { type: [String], default: [] },
  },
  { _id: false }
);

const speakingScenarioSchema = new mongoose.Schema(
  {
    situation: { type: String, required: true },
    category: { type: String, required: true },
    framework: { type: String, required: true }, // free text: "PREP", "STAR", "3-2-1", or a plain-language structure
    guidance: { type: String, required: true },
    modelAnswer: { type: String, required: true },
  },
  { _id: false }
);

const dailyProgramSchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true, unique: true, min: 1, max: 90 },
    phase: {
      type: String,
      required: true,
      enum: ['foundation', 'development', 'advanced'],
    },
    theme: { type: String, required: true },
    isMilestone: { type: Boolean, default: false },
    reviewFocus: { type: String, default: null }, // only meaningful when isMilestone is true
    tongueTwister: { type: tongueTwisterSchema, required: true },
    reading: { type: readingSchema, required: true },
    reflectionQuestions: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 3,
        message: 'A day needs at least 3 reflection questions',
      },
    },
    speedReading: { type: speedReadingSchema, required: true },
    vocabularyTermIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VocabularyTerm' }],
    speakingScenarios: {
      type: [speakingScenarioSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length === 2,
        message: 'A day must have exactly 2 speaking scenarios',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DailyProgram', dailyProgramSchema);
