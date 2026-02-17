import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { login as apiLogin, register as apiRegister } from '@/api/auth';
import { getProfile } from '@/api/users';
import type { UserResponse } from '@/api/types';

interface AuthContextValue {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: auth0User, isAuthenticated: auth0Authenticated, isLoading: auth0Loading } = useAuth0();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  // Sync Auth0 authentication with backend
  const syncWithBackend = useCallback(async (email: string) => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await apiLogin(email);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      const profile = await getProfile();
      setUser(profile);
    } catch {
      // User not found (401) - try register
      try {
        const res = await apiRegister(email);
        localStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {
        console.error('Failed to sync with backend:', err);
      }
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [syncing]);

  // When Auth0 user changes, sync with backend
  useEffect(() => {
    if (auth0Loading) {
      setLoading(true);
      return;
    }

    if (auth0Authenticated && auth0User?.email) {
      // User is authenticated with Auth0, sync with backend
      const backendToken = localStorage.getItem(TOKEN_KEY);
      if (!backendToken || !user) {
        syncWithBackend(auth0User.email);
      } else {
        setLoading(false);
      }
    } else {
      // No Auth0 authentication, clear backend state
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [auth0Loading, auth0Authenticated, auth0User, syncWithBackend, user]);

  // Login function for Auth0 (will be triggered by Auth0Provider)
  const login = useCallback(
    async (email: string) => {
      await syncWithBackend(email);
      navigate('/profile');
    },
    [navigate, syncWithBackend]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  const refetchUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
    refetchUser,
  }), [token, user, loading, login, logout, refetchUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
