const mongoose = require('mongoose');

// Global vocabulary bank. A term is created once (by the seed script) and
// referenced by ObjectId from DailyProgram.vocabularyTermIds. Reused across
// spaced-repetition review via VocabularyProgress (Phase 6).
const vocabularyTermSchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // Free text by design (not a strict enum) so new categories can be
      // introduced in later batches without a schema migration. Current
      // categories in use: Professional Communication, Procurement,
      // Logistics & Supply Chain, Humanitarian Operations,
      // Finance & Accounting, Inventory & Warehouse, Audit & Compliance,
      // Workplace Communication, Stakeholder & Supplier Relations.
    },
    simpleDefinition: { type: String, required: true },
    professionalDefinition: { type: String, required: true },
    exampleSentence: { type: String, required: true },
    workplaceExample: { type: String, required: true },
    relatedTerms: { type: [String], default: [] },
  },
  { timestamps: true }
);

vocabularyTermSchema.index({ term: 1 }, { unique: true });
vocabularyTermSchema.index({ category: 1 });

module.exports = mongoose.model('VocabularyTerm', vocabularyTermSchema);
