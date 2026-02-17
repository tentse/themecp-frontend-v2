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
import { AUTH_EXPIRED_EVENT } from '@/api/client';
import { login as apiLogin, register as apiRegister } from '@/api/auth';
import { getProfile } from '@/api/users';
import type { UserResponse } from '@/api/types';

interface AuthContextValue {
  token: string | null;
  user: UserResponse | null;
  email: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'token';
const EMAIL_KEY = 'user_email';

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user: auth0User, isAuthenticated: auth0Authenticated, isLoading: auth0Loading, logout: auth0Logout } = useAuth0();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [registerAttempts, setRegisterAttempts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  const clearAuthState = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateStoredToken = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      clearAuthState();
      setLoading(false);
      return;
    }

    try {
      const profile = await getProfile();
      setToken(storedToken);
      setUser(profile);
    } catch {
      clearAuthState();
      setError('Your session has expired. Please sign in again.');
    } finally {
      setLoading(false);
    }
  }, [clearAuthState]);

  // Sync Auth0 authentication with backend
  const syncWithBackend = useCallback(async (email: string) => {
    if (syncing) return;
    setSyncing(true);
    setError(null);
    try {
      const res = await apiLogin(email);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      const profile = await getProfile();
      setUser(profile);
      setRegisterAttempts(prev => ({ ...prev, [email]: 0 }));
    } catch {
      // User not found (401) - try register with retry limit
      const currentAttempts = registerAttempts[email] || 0;
      
      if (currentAttempts >= 3) {
        console.error(`Max register attempts (3) reached for ${email}`);
        setError('Failed to authenticate with backend. Please try again.');
        return;
      }

      try {
        setRegisterAttempts(prev => ({ ...prev, [email]: currentAttempts + 1 }));
        const res = await apiRegister(email);
        localStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        const profile = await getProfile();
        setUser(profile);
        setRegisterAttempts(prev => ({ ...prev, [email]: 0 }));
      } catch (err) {
        console.error(`Failed to sync with backend (attempt ${currentAttempts + 1}/3):`, err);
        setError('Failed to authenticate with backend. Please try again.');
      }
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [syncing, registerAttempts]);

  // When Auth0 user changes, store email and sync with backend
  useEffect(() => {
    if (auth0Loading) {
      setLoading(true);
      return;
    }

    if (auth0Authenticated && auth0User?.email) {
      // Store email immediately from Auth0 (works even if backend is down)
      localStorage.setItem(EMAIL_KEY, auth0User.email);
      
      // Try to sync with backend if not already synced
      const backendToken = localStorage.getItem(TOKEN_KEY);
      if (!backendToken || !user) {
        syncWithBackend(auth0User.email);
      } else {
        setLoading(false);
      }
    } else {
      validateStoredToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth0Loading, auth0Authenticated, auth0User?.email]);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuthState();
      setError('Your session has expired. Please sign in again.');
      navigate('/login');
    };

    globalThis.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      globalThis.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [clearAuthState, navigate]);

  const logout = useCallback(() => {
    clearAuthState();
    setError(null);
    auth0Logout({ logoutParams: { returnTo: globalThis.location.origin } });
    navigate('/');
  }, [auth0Logout, clearAuthState, navigate]);

  const refetchUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      clearAuthState();
      setError('Your session has expired. Please sign in again.');
      navigate('/login');
    }
  }, [clearAuthState, navigate]);

  const value: AuthContextValue = useMemo(() => ({
    token,
    user,
    email: auth0User?.email || null,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    clearError,
    logout,
    refetchUser,
  }), [token, user, auth0User?.email, loading, error, clearError, logout, refetchUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
