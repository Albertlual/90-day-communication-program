/**
 * Validates every server/data/curriculum/days/*.json batch file against
 * the rules in CURRICULUM_MAP.md, without needing a MongoDB connection.
 * Run with: node server/scripts/validateCurriculum.js
 *
 * Checks:
 *  - Every file is valid JSON, an array of day objects
 *  - Required fields are present on every day
 *  - Day numbers are unique across ALL batch files combined, and within 1-90
 *  - Milestone days (dayNumber % 10 === 0) are flagged isMilestone: true,
 *    have exactly 3 vocabulary terms, and all others have 5-6
 *  - Every day has exactly 2 speaking scenarios and at least 3 reflection questions
 *  - No vocabulary term name is reused across the whole curriculum so far
 *    (case-insensitive)
 */
const fs = require('fs');
const path = require('path');

const DAYS_DIR = path.resolve(__dirname, '..', 'data', 'curriculum', 'days');

let errors = [];
let warnings = [];
const seenDayNumbers = new Map(); // dayNumber -> file
const seenTerms = new Map(); // lowercased term -> { term, file, dayNumber }

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

if (!fs.existsSync(DAYS_DIR)) {
  console.error(`No curriculum directory found at ${DAYS_DIR}`);
  process.exit(1);
}

const files = fs
  .readdirSync(DAYS_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();

if (files.length === 0) {
  console.error('No curriculum batch files found to validate.');
  process.exit(1);
}

let totalDays = 0;

for (const file of files) {
  const fullPath = path.join(DAYS_DIR, file);
  let days;
  try {
    days = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (e) {
    fail(`${file}: invalid JSON — ${e.message}`);
    continue;
  }

  if (!Array.isArray(days)) {
    fail(`${file}: expected a top-level array of day objects`);
    continue;
  }

  for (const day of days) {
    totalDays += 1;
    const ref = `${file} / Day ${day.dayNumber}`;

    // --- Day number ---
    if (typeof day.dayNumber !== 'number' || day.dayNumber < 1 || day.dayNumber > 90) {
      fail(`${ref}: dayNumber must be a number 1-90`);
    } else if (seenDayNumbers.has(day.dayNumber)) {
      fail(`${ref}: duplicate dayNumber, already used in ${seenDayNumbers.get(day.dayNumber)}`);
    } else {
      seenDayNumbers.set(day.dayNumber, file);
    }

    // --- Required top-level fields ---
    ['phase', 'theme', 'tongueTwister', 'reading', 'reflectionQuestions', 'speedReading', 'vocabulary', 'speakingScenarios'].forEach(
      (field) => {
        if (day[field] === undefined) fail(`${ref}: missing required field "${field}"`);
      }
    );

    if (!['foundation', 'development', 'advanced'].includes(day.phase)) {
      fail(`${ref}: phase must be one of foundation/development/advanced, got "${day.phase}"`);
    }

    // --- Reflection questions ---
    if (Array.isArray(day.reflectionQuestions) && day.reflectionQuestions.length < 3) {
      fail(`${ref}: needs at least 3 reflection questions, has ${day.reflectionQuestions.length}`);
    }

    // --- Speaking scenarios ---
    if (Array.isArray(day.speakingScenarios) && day.speakingScenarios.length !== 2) {
      fail(`${ref}: must have exactly 2 speaking scenarios, has ${day.speakingScenarios.length}`);
    }
    (day.speakingScenarios || []).forEach((s, i) => {
      ['situation', 'category', 'framework', 'guidance', 'modelAnswer'].forEach((f) => {
        if (!s[f]) fail(`${ref}: speakingScenarios[${i}] missing "${f}"`);
      });
    });

    // --- Milestone rules ---
    const isMilestoneDay = day.dayNumber % 10 === 0;
    if (isMilestoneDay && day.isMilestone !== true) {
      fail(`${ref}: dayNumber ${day.dayNumber} is a multiple of 10 and must have isMilestone: true`);
    }
    if (!isMilestoneDay && day.isMilestone === true) {
      fail(`${ref}: isMilestone is true but dayNumber ${day.dayNumber} is not a multiple of 10`);
    }

    const vocabCount = Array.isArray(day.vocabulary) ? day.vocabulary.length : 0;
    if (isMilestoneDay) {
      if (vocabCount !== 3) {
        warn(`${ref}: milestone day expected exactly 3 new vocabulary terms, has ${vocabCount}`);
      }
    } else if (vocabCount < 5 || vocabCount > 6) {
      warn(`${ref}: expected 5-6 vocabulary terms, has ${vocabCount}`);
    }

    // --- Vocabulary structure + global uniqueness ---
    (day.vocabulary || []).forEach((term) => {
      ['term', 'category', 'simpleDefinition', 'professionalDefinition', 'exampleSentence', 'workplaceExample'].forEach(
        (f) => {
          if (!term[f]) fail(`${ref}: vocabulary term "${term.term || '?'}" missing "${f}"`);
        }
      );
      if (term.term) {
        const key = term.term.trim().toLowerCase();
        if (seenTerms.has(key)) {
          const prior = seenTerms.get(key);
          fail(
            `Duplicate vocabulary term "${term.term}" in ${ref} — already introduced in ${prior.file} / Day ${prior.dayNumber}`
          );
        } else {
          seenTerms.set(key, { term: term.term, file, dayNumber: day.dayNumber });
        }
      }
    });

    // --- Reading / speed reading word counts sanity check ---
    if (day.reading && day.reading.content) {
      const wc = day.reading.content.trim().split(/\s+/).length;
      if (wc < 100) warn(`${ref}: reading content is unusually short (${wc} words)`);
    }
    if (day.speedReading) {
      if (!day.speedReading.wordCount || day.speedReading.wordCount < 50) {
        warn(`${ref}: speedReading.wordCount looks too low (${day.speedReading.wordCount})`);
      }
      if (day.speedReading.passage) {
        const actual = day.speedReading.passage.trim().split(/\s+/).length;
        if (actual !== day.speedReading.wordCount) {
          fail(
            `${ref}: speedReading.wordCount (${day.speedReading.wordCount}) does not match actual passage word count (${actual})`
          );
        }
      }
    }
  }
}

console.log(`\nValidated ${totalDays} day(s) across ${files.length} file(s): ${files.join(', ')}\n`);

if (warnings.length) {
  console.log(`⚠ ${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log('  -', w));
  console.log('');
}

if (errors.length) {
  console.error(`✗ ${errors.length} error(s):`);
  errors.forEach((e) => console.error('  -', e));
  process.exit(1);
}

console.log('✓ All curriculum files passed validation.');
