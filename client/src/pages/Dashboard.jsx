import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import progressService from '../services/progressService';

function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError('');

      try {
        const payload = await progressService.getSummary();
        setSummary(payload);
      } catch (err) {
        setError(err.message || 'Unable to load your progress.');
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const availableDay = useMemo(() => {
    if (!user) return 1;
    return Math.min(user.currentDay, 60);
  }, [user]);

  const progressValue = summary ? (summary.completedDaysCount / 60) * 100 : 0;

  if (loading) {
    return <main className="page-shell"><div className="loading-box">Loading your dashboard…</div></main>;
  }

  if (error) {
    return (
      <main className="page-shell">
        <div className="inline-error">{error}</div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-card">
        <p className="tiny-tag">Progress dashboard</p>
        <h1 className="page-title">Hello, {user?.name || 'friend'}.</h1>

        <div className="stack">
          <div className="panel" style={{ padding: 20 }}>
            <h2 className="section-title">Day {availableDay} of 60 available</h2>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={60} aria-valuenow={summary?.completedDaysCount || 0}>
              <div className="progressbar" aria-hidden="true">
                <div className="progressbar-fill" style={{ width: `${Math.min(progressValue, 100)}%` }} />
              </div>
            </div>
            <p className="small-muted" style={{ marginTop: 12 }}>
              {summary?.completedDaysCount || 0} of 60 available days completed.
            </p>

            {user?.currentDay > 60 ? (
              <p className="muted">
                You’ve completed all currently available days — Days 61–90 are coming later.
              </p>
            ) : (
              <Link className="btn" to={`/day/${availableDay}`}>
                Continue Day {availableDay}
              </Link>
            )}
          </div>

          <div className="panel" style={{ padding: 20 }}>
            <h2 className="section-title">Recent completed days</h2>
            {summary?.recentProgress?.length ? (
              <ul className="list">
                {summary.recentProgress.map((entry) => (
                  <li key={entry.dayNumber}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span>Day {entry.dayNumber}</span>
                      {entry.dailyScoreSummary?.speedWpm ? (
                        <span className="small-muted">WPM {entry.dailyScoreSummary.speedWpm}</span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No completed days yet — your first day is ready.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
