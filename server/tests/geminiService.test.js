const test = require('node:test');
const assert = require('node:assert/strict');

const geminiService = require('../services/geminiService');

test('buildEvaluationPrompt should include stage-specific guidance and safety rules', () => {
  const prompt = geminiService.buildEvaluationPrompt({
    stage: 'reflection',
    userName: 'Alicia',
    responseText: 'I want to speak with more confidence in meetings.',
    dayNumber: 3,
  });

  assert.match(prompt, /reflection/i);
  assert.match(prompt, /Alicia/i);
  assert.match(prompt, /safe and professional/i);
  assert.match(prompt, /meeting/i);
});

test('evaluateResponse should return a structured fallback result when the API key is missing', async () => {
  const result = await geminiService.evaluateResponse({
    stage: 'reflection',
    dayNumber: 3,
    responseText: 'I want to speak with more confidence in meetings.',
    userName: 'Alicia',
  });

  assert.equal(result.status, 'skipped');
  assert.ok(result.summary);
  assert.equal(result.mode, 'fallback');
});
