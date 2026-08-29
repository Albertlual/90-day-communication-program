/**
 * Seeds MongoDB with curriculum content from server/data/curriculum/days/*.json.
 *
 * Usage:
 *   node server/scripts/seedCurriculum.js
 *
 * Requires a valid MONGODB_URI in .env (project root). Run
 * server/scripts/validateCurriculum.js first — this script does not
 * re-validate structure, it assumes the content already passed that check.
 *
 * What it does, per day object in every batch file:
 *   1. Upserts each vocabulary term into VocabularyTerm by term name
 *      (case-insensitive match), so a term already in the DB from an
 *      earlier batch is reused rather than duplicated.
 *   2. Replaces the day's embedded `vocabulary` array with the resulting
 *      ObjectIds and upserts the DailyProgram document by dayNumber.
 *
 * Safe to re-run: both upserts are idempotent.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const fs = require('fs');
const mongoose = require('mongoose');

const DailyProgram = require('../models/DailyProgram');
const VocabularyTerm = require('../models/VocabularyTerm');
const logger = require('../utils/logger');

const DAYS_DIR = path.resolve(__dirname, '..', 'data', 'curriculum', 'days');

async function upsertVocabularyTerm(termData) {
  const existing = await VocabularyTerm.findOne({
    term: { $regex: `^${termData.term.trim()}$`, $options: 'i' },
  });

  if (existing) {
    return existing._id;
  }

  const created = await VocabularyTerm.create({
    term: termData.term.trim(),
    category: termData.category,
    simpleDefinition: termData.simpleDefinition,
    professionalDefinition: termData.professionalDefinition,
    exampleSentence: termData.exampleSentence,
    workplaceExample: termData.workplaceExample,
    relatedTerms: termData.relatedTerms || [],
  });
  return created._id;
}

async function seedDay(dayData) {
  const vocabularyTermIds = [];
  for (const termData of dayData.vocabulary || []) {
    const id = await upsertVocabularyTerm(termData);
    vocabularyTermIds.push(id);
  }

  const { vocabulary, ...dayFields } = dayData;

  await DailyProgram.findOneAndUpdate(
    { dayNumber: dayData.dayNumber },
    { ...dayFields, vocabularyTermIds },
    { upsert: true, new: true, runValidators: true }
  );
}

async function run() {
  if (!process.env.MONGODB_URI) {
    logger.error('MONGODB_URI is not set. Copy .env.example to .env and fill it in first.');
    process.exit(1);
  }

  if (!fs.existsSync(DAYS_DIR)) {
    logger.error(`No curriculum directory found at ${DAYS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(DAYS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    logger.error('No curriculum batch files found to seed.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('MongoDB connected for seeding');

  let seededDays = 0;
  let seededFiles = [];

  for (const file of files) {
    const days = JSON.parse(fs.readFileSync(path.join(DAYS_DIR, file), 'utf8'));
    for (const day of days) {
      await seedDay(day);
      seededDays += 1;
    }
    seededFiles.push(file);
    logger.info(`Seeded ${file} (${days.length} day(s))`);
  }

  const totalVocabTerms = await VocabularyTerm.countDocuments();
  const totalDays = await DailyProgram.countDocuments();

  logger.info('Seed complete', {
    filesProcessed: seededFiles,
    daysSeededThisRun: seededDays,
    totalDailyProgramDocs: totalDays,
    totalVocabularyTermDocs: totalVocabTerms,
  });

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  logger.error('Seeding failed', { message: err.message, stack: err.stack });
  process.exit(1);
});
