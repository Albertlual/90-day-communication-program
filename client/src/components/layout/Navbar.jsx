import { NavLink } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="topbar" aria-label="Main navigation">
      <div className="topbar-inner">
        <NavLink to={user ? '/dashboard' : '/'} className="brand-link">
          90-Day Program
        </NavLink>

        <div className="nav-actions">
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <button type="button" className="link-button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
