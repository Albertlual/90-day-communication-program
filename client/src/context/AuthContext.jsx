import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.me();
      setUser(response.user);
      return response.user;
    } catch (error) {
      setUser(null);
      return null;
    }
  }, []);

  const login = useCallback(async (payload) => {
    const response = await authService.login(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const currentUser = await refreshUser();
        if (!mounted) return;
        setUser(currentUser);
      } catch (error) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export default AuthContext;
