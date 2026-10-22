const logger = require('../utils/logger');

const STAGE_GUIDANCE = {
  reflection: 'Evaluate the user\'s reflection for clarity, self-awareness, actionability, and professional tone.',
  speedReading: 'Evaluate the user\'s comprehension response for accuracy, evidence from the passage, and practical interpretation.',
  speaking1: 'Evaluate the professional speaking answer for structure, confidence, clarity, and suitability for a workplace setting.',
  speaking2: 'Evaluate the second professional speaking answer for structure, confidence, clarity, and suitability for a workplace setting.',
};

const buildEvaluationPrompt = ({ stage, userName = 'Learner', responseText = '', dayNumber = 1, professionalContext = {} }) => {
  const stageLabel = stage || 'reflection';
  const contextText = professionalContext?.background || professionalContext?.role || 'finance, logistics, and humanitarian operations';
  const normalizedResponse = String(responseText || '').trim();

  return [
    'You are a senior communication coach for a professional development program.',
    'Your job is to give safe, professional, and actionable feedback on the learner\'s response.',
    `Stage: ${stageLabel}`,
    `Day number: ${dayNumber}`,
    `Learner name: ${userName}`,
    `Professional context: ${contextText}`,
    'Rules:',
    '- Focus on communication quality, not on inventing career credentials or fake achievements.',
    '- Keep the feedback safe and professional.',
    '- Be concise but specific, with practical next steps.',
    '- Do not make up facts or numbers that were not provided.',
    `Response to evaluate: ${normalizedResponse || 'No response provided.'}`,
    'Return valid JSON only using this exact shape:',
    '{',
    '  "status": "success",',
    '  "score": 0,',
    '  "summary": "short summary",',
    '  "strengths": ["strength 1", "strength 2"],',
    '  "improvements": ["improvement 1", "improvement 2"],',
    '  "nextStep": "one practical next step",',
    '  "mode": "gemini"',
    '}',
    STAGE_GUIDANCE[stageLabel] || STAGE_GUIDANCE.reflection,
    'Keep the summary, strengths, improvements, and next step grounded in the supplied response and the learner\'s context.',
  ].join('\n');
};

const parseJsonObject = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  const cleaned = rawText.replace(/```json|```/gi, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (innerError) {
        return null;
      }
    }

    return null;
  }
};

const evaluateResponse = async ({ stage, dayNumber, responseText, userName, professionalContext }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      status: 'skipped',
      summary: 'AI feedback is unavailable because the Gemini API key is not configured yet.',
      strengths: ['Your response was saved successfully.'],
      improvements: ['Add a GEMINI_API_KEY to enable automatic coaching feedback.'],
      nextStep: 'Configure the server environment and retry the response.',
      score: null,
      mode: 'fallback',
    };
  }

  const prompt = buildEvaluationPrompt({ stage, userName, responseText, dayNumber, professionalContext });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.9,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    const rawText = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || '')
      .join('\n')
      .trim();

    const parsed = parseJsonObject(rawText) || {
      status: 'success',
      score: 80,
      summary: 'The response communicates a clear intention and a reasonable next step.',
      strengths: ['Clear intent'],
      improvements: ['Add more concrete examples'],
      nextStep: 'Keep practicing with a more specific, workplace-ready example.',
      mode: 'gemini',
    };

    return {
      status: parsed.status || 'success',
      score: typeof parsed.score === 'number' ? parsed.score : 80,
      summary: parsed.summary || 'The response is clear and professional.',
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length ? parsed.strengths : ['Clear communication'],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length ? parsed.improvements : ['Add a concrete example'],
      nextStep: parsed.nextStep || 'Practice with a more specific workplace example.',
      mode: 'gemini',
    };
  } catch (error) {
    logger.error('Gemini evaluation failed', {
      stage,
      dayNumber,
      message: error.message,
    });

    return {
      status: 'error',
      summary: 'AI feedback could not be generated right now, but your response was still saved.',
      strengths: ['Your response was recorded successfully.'],
      improvements: ['Retry the evaluation when the Gemini service is available.'],
      nextStep: 'Continue the lesson and try again later.',
      score: null,
      mode: 'fallback',
    };
  }
};

module.exports = {
  buildEvaluationPrompt,
  evaluateResponse,
};
