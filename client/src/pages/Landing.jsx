import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function Landing() {
  const { user } = useAuth();

  return (
    <main className="page-shell">
      <section className="landing-card">
        <p className="tiny-tag">Professional communication practice</p>
        <h1 className="hero-title">90-Day professional communication program</h1>
        <p className="subtitle">
          Build a clearer, more confident professional voice for finance, logistics,
          and humanitarian operations work.
        </p>

        <div className="row" style={{ marginBottom: 24 }}>
          <Link to={user ? '/dashboard' : '/register'} className="btn">
            {user ? 'Go to dashboard' : 'Create account'}
          </Link>
          {!user && (
            <Link to="/login" className="btn secondary">
              Log in
            </Link>
          )}
        </div>

        <div className="stack">
          <div className="panel" style={{ padding: 20 }}>
            <h2 className="section-title">Daily sequence</h2>
            <ul className="list">
              <li>Tongue twister and clarity practice</li>
              <li>Focused reading and reflection</li>
              <li>Speed reading with comprehension</li>
              <li>Professional vocabulary review</li>
              <li>Two speaking scenarios with guided structure</li>
            </ul>
          </div>

          <div className="panel" style={{ padding: 20 }}>
            <h2 className="section-title">What you will practice</h2>
            <ul className="list">
              <li>Clear updates and status communication</li>
              <li>Professional speaking under time pressure</li>
              <li>Structured interview and brief answers</li>
              <li>Plain-language explanation for mixed audiences</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Landing;
