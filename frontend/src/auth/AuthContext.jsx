import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const stored = window.sessionStorage.getItem('kinyarwanda-user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    window.sessionStorage.removeItem('kinyarwanda-user');
    return null;
  }
}

function persistSession(data) {
  window.sessionStorage.setItem('kinyarwanda-token', data.token);
  window.sessionStorage.setItem('kinyarwanda-user', JSON.stringify(data.user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  async function login(credentials) {
    const data = await api('/login', { method: 'POST', body: credentials });
    persistSession(data);
    setUser(data.user);
    return data.user;
  }

  async function register(details) {
    const data = await api('/register', { method: 'POST', body: details });
    persistSession(data);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    window.sessionStorage.removeItem('kinyarwanda-token');
    window.sessionStorage.removeItem('kinyarwanda-user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
