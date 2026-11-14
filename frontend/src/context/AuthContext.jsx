import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, loadSession, saveSession, setSessionExpiredHandler, setToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const session = loadSession();
    return session?.token ? { email: session.email } : null;
  });

  const startSession = useCallback((session) => {
    setToken(session.token);
    saveSession(session);
    setUser({ email: session.email });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    saveSession(null);
    setUser(null);
  }, []);

  // Se il backend risponde 401 a una richiesta autenticata, si esce.
  useEffect(() => {
    setSessionExpiredHandler(logout);
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      login: async (email, password) => startSession(await api.login(email, password)),
      register: async (email, password) => startSession(await api.register(email, password)),
      logout,
    }),
    [user, startSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth va usato dentro <AuthProvider>');
  return context;
}
