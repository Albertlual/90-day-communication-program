import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import programService from '../services/programService';
import progressService from '../services/progressService';

const STAGE_ORDER = [
  'tongueTwister',
  'reading',
  'reflection',
  'speedReading',
  'vocabulary',
  'speaking1',
  'speaking2',
];

const STAGE_LABELS = {
  tongueTwister: 'Tongue twister',
  reading: 'Reading',
  reflection: 'Reflection',
  speedReading: 'Speed reading',
  vocabulary: 'Vocabulary',
  speaking1: 'Speaking 1',
  speaking2: 'Speaking 2',
};

function parseDayNumber(value) {
  const dayNumber = Number(value);
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 90) {
    return null;
  }
  return dayNumber;
}

function formatStageText(value) {
  return STAGE_LABELS[value] || value;
}

function DailyProgram() {
  const navigate = useNavigate();
  const { dayNumber: paramDayNumber } = useParams();
  const { user, refreshUser } = useAuth();
  const [day, setDay] = useState(null);
  const [progress, setProgress] = useState(null);
  const [responses, setResponses] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completeSummary, setCompleteSummary] = useState('');
  const [stageMessage, setStageMessage] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [wpm, setWpm] = useState(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const startRef = useRef(null);

  const dayNumber = parseDayNumber(paramDayNumber);

  useEffect(() => {
    if (!dayNumber) {
      setError('This day is not available.');
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      setCompleteSummary('');

      try {
        const [dayResponse, progressResponse] = await Promise.all([
          programService.getDay(dayNumber),
          progressService.getDayProgress(dayNumber),
        ]);

        if (!active) return;

        setDay(dayResponse.day);
        setProgress(progressResponse.progress);
        setResponses(progressResponse.responses || []);

        const stageName = progressResponse.progress?.currentStage || 'tongueTwister';
        const stageIndex = STAGE_ORDER.includes(stageName) ? STAGE_ORDER.indexOf(stageName) : STAGE_ORDER.length - 1;
        setCurrentStageIndex(stageIndex);

        const savedResponse = (progressResponse.responses || []).find((entry) => entry.stage === stageName);
        if (savedResponse) {
          setInputValue(savedResponse.responseText || '');
          setAiFeedback(savedResponse.aiEvaluation || null);
          if (stageName === 'speedReading') {
            setWpm(savedResponse.metadata?.wpm || null);
          }
        } else {
          setInputValue('');
          setAiFeedback(null);
          setWpm(null);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Unable to load this day.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [dayNumber]);

  useEffect(() => {
    if (!timerRunning) return undefined;

    const tick = setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(tick);
  }, [timerRunning]);

  const currentStage = progress?.currentStage === 'complete' ? 'complete' : STAGE_ORDER[currentStageIndex] || 'tongueTwister';

  useEffect(() => {
    if (progress?.currentStage === 'complete') {
      setCurrentStageIndex(STAGE_ORDER.length - 1);
    }
  }, [progress?.currentStage]);

  const activeStageKey = useMemo(() => {
    if (!day) return null;

    if (currentStage === 'tongueTwister') return 'tongueTwister';
    if (currentStage === 'reading') return 'reading';
    if (currentStage === 'reflection') return 'reflection';
    if (currentStage === 'speedReading') return 'speedReading';
    if (currentStage === 'vocabulary') return 'vocabulary';
    if (currentStage === 'speaking1') return 'speaking1';
    if (currentStage === 'speaking2') return 'speaking2';
    return 'complete';
  }, [currentStage, day]);

  const markStageComplete = async (payload) => {
    if (submitting) return;
    setSubmitting(true);
    setStageMessage('');

    try {
      const result = await progressService.saveStage(payload);
      setProgress(result.progress);
      setAiFeedback(result.aiEvaluation || null);
      const nextIndex = STAGE_ORDER.indexOf(result.progress.currentStage);
      setCurrentStageIndex(nextIndex >= 0 ? nextIndex : STAGE_ORDER.length - 1);
      setInputValue('');
      setStageMessage(result.aiEvaluation ? 'Saved. AI feedback is ready.' : 'Saved.');
      setShowModelAnswer(false);
    } catch (err) {
      setStageMessage(err.message || 'Unable to save your progress.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitText = async () => {
    if (!currentStage || !day || !inputValue.trim()) return;

    if (currentStage === 'speedReading') {
      const seconds = timerSeconds;
      const newWpm = seconds >= 5 ? Math.round((day.speedReading.wordCount / (seconds / 60))) : null;
      setWpm(newWpm);
      await markStageComplete({
        dayNumber,
        stage: currentStage,
        responseText: inputValue,
        wpm: newWpm,
        durationSeconds: seconds,
      });
      return;
    }

    await markStageComplete({
      dayNumber,
      stage: currentStage,
      responseText: inputValue,
    });
  };

  const handleCompleteDay = async () => {
    if (!dayNumber) return;
    setSubmitting(true);
    setError('');
    setCompleteSummary('');

    try {
      const result = await progressService.completeDay({ dayNumber });
      setProgress(result.progress);
      await refreshUser();
      setCompleteSummary('Day completed.');
      if (dayNumber < 60) {
        navigate(`/day/${dayNumber + 1}`);
      }
    } catch (err) {
      setError(err.message || 'Unable to complete this day.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="page-shell"><div className="loading-box">Loading day {dayNumber || ''}…</div></main>;
  }

  if (!dayNumber) {
    return (
      <main className="page-shell">
        <div className="inline-error">This day is not available. Enter a valid day between 1 and 90.</div>
      </main>
    );
  }

  if (error) {
    const friendlyMessage =
      error.includes('locked') ||
      error.includes('This day is not available') ||
      error.includes('not available') ||
      error.includes('Day')
        ? error
        : 'This day is not available yet.';

    if (
      error.includes('locked') ||
      error.includes('not available') ||
      error.includes('This day is not available') ||
      error.includes('Day')
    ) {
      return (
        <main className="page-shell">
          <div className="inline-error">
            {friendlyMessage}
            <div style={{ marginTop: 12 }}>
              <Link to="/dashboard" className="btn secondary">
                Back to dashboard
              </Link>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="page-shell">
        <div className="inline-error">{error}</div>
      </main>
    );
  }

  const allStagesComplete = !!progress && STAGE_ORDER.every((key) => progress.stagesCompleted[key]);
  const hasSavedResponse = responses.some((entry) => entry.stage === currentStage);

  const renderAiFeedback = () => {
    if (!aiFeedback) return null;

    const scoreText = aiFeedback.score !== null && aiFeedback.score !== undefined ? `${aiFeedback.score}/100` : 'AI review';

    return (
      <div className="panel ai-feedback" style={{ marginTop: 20, padding: 20 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="tiny-tag">Gemini Coaching</p>
            <h3 style={{ margin: '8px 0 0' }}>Feedback</h3>
          </div>
          <div className="score-pill">{scoreText}</div>
        </div>

        <p className="small-muted" style={{ marginTop: 12, marginBottom: 8 }}>
          {aiFeedback.summary}
        </p>

        <div className="stack" style={{ marginTop: 16 }}>
          <div>
            <strong>Strengths</strong>
            <ul className="list">
              {(aiFeedback.strengths || []).map((point) => <li key={point}>{point}</li>)}
            </ul>
          </div>

          <div>
            <strong>Opportunities</strong>
            <ul className="list">
              {(aiFeedback.improvements || []).map((point) => <li key={point}>{point}</li>)}
            </ul>
          </div>

          <div>
            <strong>Next step</strong>
            <p style={{ margin: 0 }}>{aiFeedback.nextStep}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="page-shell">
      <section className="program-shell">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p className="tiny-tag">Day {day.dayNumber}</p>
            <h1 className="page-title" style={{ marginBottom: 4 }}>{day.theme}</h1>
            <p className="small-muted">
              {day.phase} {day.isMilestone ? '• Milestone' : ''}
            </p>
          </div>
          {day.isMilestone && <span className="badge gold">Milestone</span>}
        </div>

        <div className="stage-indicator" aria-label="Daily stages">
          {STAGE_ORDER.map((stage, index) => {
            const complete = progress?.stagesCompleted?.[stage];
            const isCurrent = index === currentStageIndex;
            return (
              <button
                type="button"
                key={stage}
                className={`stage-pill ${complete ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => {
                  if (complete) {
                    setCurrentStageIndex(index);
                    setStageMessage(`${formatStageText(stage)} — completed.`);
                  }
                }}
                disabled={!complete}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="stage-panel">
          {currentStage === 'tongueTwister' && (
            <>
              <h2>{STAGE_LABELS.tongueTwister}</h2>
              <p className="reading-text" style={{ textAlign: 'left' }}>{day.tongueTwister.text}</p>
              <p><strong>Difficulty:</strong> {day.tongueTwister.difficulty}</p>
              <p><strong>Focus sound:</strong> {day.tongueTwister.focusSound}</p>
              <p className="small-muted">Repeat {day.tongueTwister.repetitionTarget} times, clarity before speed.</p>
              <button
                type="button"
                className="btn"
                disabled={submitting || progress?.stagesCompleted?.tongueTwister}
                onClick={() => markStageComplete({ dayNumber, stage: 'tongueTwister' })}
              >
                {progress?.stagesCompleted?.tongueTwister ? 'Completed' : 'Mark complete'}
              </button>
            </>
          )}

          {currentStage === 'reading' && (
            <>
              <h2>{STAGE_LABELS.reading}</h2>
              <h3>{day.reading.title}</h3>
              <p className="small-muted">Estimated {day.reading.estimatedMinutes} minutes</p>
              <ul className="list">
                {day.reading.keyConcepts.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className="reading-text" style={{ marginTop: 20 }}>
                {day.reading.content.split('\n\n').map((paragraph, index) => (
                  <p key={`${day.dayNumber}-${index}`}>{paragraph}</p>
                ))}
              </div>
              <button
                type="button"
                className="btn"
                disabled={submitting || progress?.stagesCompleted?.reading}
                onClick={() => markStageComplete({ dayNumber, stage: 'reading' })}
              >
                {progress?.stagesCompleted?.reading ? 'Completed' : 'Mark complete'}
              </button>
            </>
          )}

          {currentStage === 'reflection' && (
            <>
              <h2>{STAGE_LABELS.reflection}</h2>
              <ul className="list">
                {day.reflectionQuestions.map((question) => <li key={question}>{question}</li>)}
              </ul>
              <div className="form-group" style={{ marginTop: 24 }}>
                <label htmlFor="reflection-response">Your combined reflection</label>
                <textarea
                  id="reflection-response"
                  className="textarea"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Write one combined response to all of the reflection prompts."
                />
              </div>
              <button
                type="button"
                className="btn"
                disabled={submitting || !inputValue.trim()}
                onClick={handleSubmitText}
              >
                {submitting ? 'Saving…' : 'Submit & continue'}
              </button>

              {renderAiFeedback()}
            </>
          )}

          {currentStage === 'speedReading' && (
            <>
              <h2>{STAGE_LABELS.speedReading}</h2>
              <p className="small-muted">Read the passage. Start the timer before you begin.</p>
              {!timerStarted && (
                <button type="button" className="btn" onClick={() => { setTimerStarted(true); setTimerRunning(true); }}>
                  Start reading
                </button>
              )}
              {timerStarted && (
                <div className="timer-box" aria-live="polite">
                  <span>Elapsed: {timerSeconds}s</span>
                  <button type="button" className="btn secondary" onClick={() => setTimerRunning((previous) => !previous)}>
                    {timerRunning ? 'Pause' : 'Resume'}
                  </button>
                  <button type="button" className="btn secondary" onClick={() => { setTimerRunning(false); const seconds = Math.max(timerSeconds, 5); const currentWpm = Math.round(day.speedReading.wordCount / (seconds / 60)); setWpm(currentWpm); setTimerSeconds(seconds); }}>
                    Finished reading
                  </button>
                </div>
              )}

              {timerStarted && (
                <div className="reading-text" style={{ marginTop: 20 }}>
                  {day.speedReading.passage.split('\n\n').map((paragraph, index) => (
                    <p key={`${day.dayNumber}-speed-${index}`}>{paragraph}</p>
                  ))}
                </div>
              )}

              {wpm !== null && (
                <div className="panel" style={{ marginTop: 20, padding: 16 }}>
                  <strong>Estimated speed:</strong> {wpm} WPM
                </div>
              )}

              <div className="form-group" style={{ marginTop: 20 }}>
                <label htmlFor="speed-reading-response">Comprehension response</label>
                <textarea
                  id="speed-reading-response"
                  className="textarea"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                />
              </div>

              <button type="button" className="btn" disabled={submitting || !inputValue.trim()} onClick={handleSubmitText}>
                {submitting ? 'Saving…' : 'Submit & continue'}
              </button>

              {renderAiFeedback()}
            </>
          )}

          {currentStage === 'vocabulary' && (
            <>
              <h2>{STAGE_LABELS.vocabulary}</h2>
              <div className="stack">
                {day.vocabularyTermIds.map((term) => (
                  <div className="panel" key={term._id || term.term} style={{ padding: 16 }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <h3 style={{ margin: 0 }}>{term.term}</h3>
                      <span className="tiny-tag">{term.category}</span>
                    </div>
                    <p><strong>Simple definition:</strong> {term.simpleDefinition}</p>
                    <p><strong>Professional definition:</strong> {term.professionalDefinition}</p>
                    <p><strong>Example:</strong> {term.exampleSentence}</p>
                    {term.workplaceExample && <p><strong>Workplace example:</strong> {term.workplaceExample}</p>}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn"
                disabled={submitting || progress?.stagesCompleted?.vocabulary}
                onClick={() => markStageComplete({ dayNumber, stage: 'vocabulary' })}
              >
                {progress?.stagesCompleted?.vocabulary ? 'Completed' : 'Mark complete'}
              </button>
            </>
          )}

          {(currentStage === 'speaking1' || currentStage === 'speaking2') && (
            <>
              <h2>{STAGE_LABELS[currentStage]}</h2>
              <div className="panel" style={{ padding: 16, marginBottom: 20 }}>
                <p><strong>Category:</strong> {day.speakingScenarios[currentStage === 'speaking1' ? 0 : 1].category}</p>
                <p><strong>Framework:</strong> {day.speakingScenarios[currentStage === 'speaking1' ? 0 : 1].framework}</p>
                <p><strong>Situation:</strong> {day.speakingScenarios[currentStage === 'speaking1' ? 0 : 1].situation}</p>
                <p><strong>Guidance:</strong> {day.speakingScenarios[currentStage === 'speaking1' ? 0 : 1].guidance}</p>
              </div>

              <div className="form-group">
                <label htmlFor={`speaking-${currentStage}-response`}>Your answer</label>
                <textarea
                  id={`speaking-${currentStage}-response`}
                  className="textarea"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Type your answer as if speaking it aloud."
                />
              </div>

              <button
                type="button"
                className="btn"
                disabled={submitting || !inputValue.trim()}
                onClick={async () => {
                  const scenario = day.speakingScenarios[currentStage === 'speaking1' ? 0 : 1];
                  await markStageComplete({
                    dayNumber,
                    stage: currentStage,
                    responseText: inputValue,
                  });
                  setShowModelAnswer(true);
                  setInputValue('');
                  if (currentStage === 'speaking1') {
                    setCurrentStageIndex(STAGE_ORDER.indexOf('speaking2'));
                  }
                  if (currentStage === 'speaking2') {
                    setCurrentStageIndex(STAGE_ORDER.length - 1);
                  }
                  setStageMessage(`Model answer available for ${scenario.category} scenario.`);
                }}
              >
                {submitting ? 'Saving…' : 'Submit answer'}
              </button>

              {renderAiFeedback()}

              {showModelAnswer && (
                <div className="panel" style={{ padding: 16, marginTop: 20 }}>
                  <h3>Model answer</h3>
                  <p>{day.speakingScenarios[currentStage === 'speaking1' ? 0 : 1].modelAnswer}</p>
                  <p className="small-muted">AI feedback on your specific answer is not available yet.</p>
                </div>
              )}
            </>
          )}

          {currentStage === 'complete' && (
            <>
              <h2>Complete Day</h2>
              <ul className="list">
                {STAGE_ORDER.map((stage) => (
                  <li key={stage}>{progress?.stagesCompleted?.[stage] ? '✓' : '○'} {formatStageText(stage)}</li>
                ))}
              </ul>
              {progress?.dailyScoreSummary?.speedWpm && (
                <p className="small-muted">Today's WPM: {progress.dailyScoreSummary.speedWpm}</p>
              )}
              <button type="button" className="btn" disabled={submitting || !allStagesComplete} onClick={handleCompleteDay}>
                {submitting ? 'Completing…' : 'Complete Day'}
              </button>
              {completeSummary && <p className="small-muted">{completeSummary}</p>}
              {dayNumber < 60 && (
                <p className="small-muted">Continue to Day {dayNumber + 1}</p>
              )}
              {dayNumber >= 60 && (
                <p className="small-muted">Days 61–90 are postponed and not yet authored.</p>
              )}
            </>
          )}

          {stageMessage && <p className="small-muted" style={{ marginTop: 18 }}>{stageMessage}</p>}
          {error && <div className="inline-error" style={{ marginTop: 18 }}>{error}</div>}
        </div>
      </section>
    </main>
  );
}

export default DailyProgram;
