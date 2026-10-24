import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setUnauthorizedHandler } from './api/client.js';
import { clearSession, loadSession, saveSession } from './api/session.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());
  const navigate = useNavigate();

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // 401 o bat ky man hinh nao -> ve trang dang nhap.
  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  const login = useCallback(async (username, password) => {
    const result = await api.login(username, password);
    saveSession(result);
    setSession(result);
    return result.user;
  }, []);

  const value = useMemo(() => ({ user: session ? session.user : null, login, logout }), [session, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
