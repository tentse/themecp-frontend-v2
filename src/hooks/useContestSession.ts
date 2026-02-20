import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveSession, createSession, startSession } from '@/api/contestSession'
import type { ContestSessionOutput } from '@/api/types'

type Phase = 'NO_SESSION' | 'REVIEW'

export function useContestSession() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('NO_SESSION')
  const [session, setSession] = useState<ContestSessionOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const s = await getActiveSession()
      setSession(s)
      if (s.status === 'REVIEW') {
        setPhase('REVIEW')
      } else if (s.status === 'RUNNING') {
        navigate('/contest/start', { replace: true })
      } else {
        setPhase('NO_SESSION')
        setSession(null)
      }
    } catch (err: unknown) {
      const apiErr = err as { status?: number }
      if (apiErr.status === 404) {
        setPhase('NO_SESSION')
        setSession(null)
      } else {
        setError(
          err && typeof err === 'object' && 'detail' in err
            ? String((err as { detail: string }).detail)
            : 'Failed to load session'
        )
        setPhase('NO_SESSION')
        setSession(null)
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  const create = useCallback(async (level: number, theme: string) => {
    setError(null)
    try {
      const s = await createSession(level, theme)
      setSession(s)
      setPhase('REVIEW')
    } catch (err: unknown) {
      const d =
        err && typeof err === 'object' && 'detail' in err
          ? (err as { detail: string }).detail
          : 'Failed to create session'
      setError(String(d))
      throw err
    }
  }, [])

  const start = useCallback(async () => {
    if (!session) return
    setError(null)
    try {
      await startSession(session.id)
      navigate('/contest/start', { replace: true })
    } catch (err: unknown) {
      const d =
        err && typeof err === 'object' && 'detail' in err
          ? (err as { detail: string }).detail
          : 'Failed to start'
      setError(String(d))
      throw err
    }
  }, [session, navigate])

  return {
    phase,
    session,
    loading,
    error,
    create,
    start,
    reload: loadSession,
  }
}
