import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getLevels } from '@/api/contestLevel';
import type { ContestLevel } from '@/api/types';

interface LevelContextValue {
  levels: ContestLevel[];
  loading: boolean;
  error: string | null;
  refetchLevels: () => Promise<void>;
  clearError: () => void;
}

const LevelContext = createContext<LevelContextValue | null>(null);

export function LevelProvider({ children }: { children: ReactNode }) {
  const [levels, setLevels] = useState<ContestLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLevels();
      setLevels(data);
    } catch {
      setLevels([]);
      setError('Failed to fetch level sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const value: LevelContextValue = { levels, loading, error, refetchLevels: fetchLevels, clearError };

  return <LevelContext.Provider value={value}>{children}</LevelContext.Provider>;
}

export function useLevel(): LevelContextValue {
  const ctx = useContext(LevelContext);
  if (!ctx) throw new Error('useLevel must be used within LevelProvider');
  return ctx;
}
