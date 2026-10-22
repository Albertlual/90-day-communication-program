import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <main className="page-shell">
      <section className="profile-card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 className="page-title">Profile</h1>
        <dl className="kv-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <dt className="small-muted">Name</dt>
            <dd style={{ margin: '6px 0 0' }}>{user?.name}</dd>
          </div>
          <div style={{ marginBottom: 12 }}>
            <dt className="small-muted">Email</dt>
            <dd style={{ margin: '6px 0 0' }}>{user?.email}</dd>
          </div>
          <div>
            <dt className="small-muted">Current day</dt>
            <dd style={{ margin: '6px 0 0' }}>Day {user?.currentDay}</dd>
          </div>
        </dl>

        <button type="button" className="btn danger" onClick={handleLogout}>
          Log out
        </button>
      </section>
    </main>
  );
}

export default Profile;
