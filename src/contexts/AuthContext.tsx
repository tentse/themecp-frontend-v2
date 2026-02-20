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

type StoredTokenValidationResult = 'ok' | 'missing' | 'invalid' | 'error';

type ProfileFetchResult =
  | { kind: 'ok'; profile: UserResponse }
  | { kind: 'invalid' }
  | { kind: 'error' };

function getErrorStatus(error_: unknown): number | null {
  return error_ && typeof error_ === 'object' && 'status' in error_ && typeof (error_ as { status: unknown }).status === 'number'
    ? (error_ as { status: number }).status
    : null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchProfileWithSingleRetry(fetcher: () => Promise<UserResponse>): Promise<ProfileFetchResult> {
  try {
    const profile = await fetcher();
    return { kind: 'ok', profile };
  } catch (error_: unknown) {
    const status = getErrorStatus(error_);
    if (status === 401 || status === 403) return { kind: 'invalid' };

    const shouldRetry = status === null || status >= 500;
    if (!shouldRetry) return { kind: 'error' };

    await sleep(800);
    try {
      const profile = await fetcher();
      return { kind: 'ok', profile };
    } catch (error__: unknown) {
      const status2 = getErrorStatus(error__);
      if (status2 === 401 || status2 === 403) return { kind: 'invalid' };
      return { kind: 'error' };
    }
  }
}

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
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateStoredToken = useCallback(async (): Promise<StoredTokenValidationResult> => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      clearAuthState();
      setLoading(false);
      return 'missing';
    }

    try {
      const result = await fetchProfileWithSingleRetry(getProfile);
      if (result.kind === 'ok') {
        setToken(storedToken);
        setUser(result.profile);
        setError(null);
        return 'ok';
      }

      if (result.kind === 'invalid') {
        clearAuthState();
        setError('Your session has expired. Please sign in again.');
        return 'invalid';
      }

      setToken(storedToken);
      setError('Unable to load your profile right now. Please try again.');
      return 'error';
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
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'status' in err && typeof (err as { status: unknown }).status === 'number'
          ? (err as { status: number }).status
          : null;

      // Only auto-register when backend explicitly says the user doesn't exist.
      if (status !== 401) {
        const detail =
          err && typeof err === 'object' && 'detail' in err && typeof (err as { detail: unknown }).detail === 'string'
            ? (err as { detail: string }).detail
            : 'Failed to authenticate with backend. Please try again.';
        setError(detail);
        return;
      }

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

  // When Auth0 user changes, sync with backend
  useEffect(() => {
    if (auth0Loading) {
      setLoading(true);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);

      // Prefer an existing backend token until it expires.
      const backendToken = localStorage.getItem(TOKEN_KEY);
      if (backendToken) {
        const result = await validateStoredToken();
        if (cancelled) return;
        if (result === 'ok') return;
        if (result === 'error') return;
      }

      // No valid backend token; fall back to Auth0->backend sync when available.
      if (auth0Authenticated && auth0User?.email) {
        await syncWithBackend(auth0User.email);
        return;
      }

      clearAuthState();
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [auth0Loading, auth0Authenticated, auth0User?.email, validateStoredToken, syncWithBackend, clearAuthState]);

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
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'status' in err && typeof (err as { status: unknown }).status === 'number'
          ? (err as { status: number }).status
          : null;

      if (status === 401 || status === 403) {
        clearAuthState();
        setError('Your session has expired. Please sign in again.');
        navigate('/login');
        return;
      }

      setError('Unable to refresh your profile right now. Please try again.');
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
