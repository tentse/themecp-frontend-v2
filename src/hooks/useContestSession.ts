import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getActiveSession,
  createSession,
  startSession,
  refreshStatus,
  endSession,
} from '@/api/contestSession'
import type {
  ContestSession,
  StartContestResponse,
  RefreshProblemStatus,
  EndContestResponse,
} from '@/api/types'

const STARTS_AT_KEY = 'contest_starts_at'

type Phase = 'NO_SESSION' | 'REVIEW' | 'COUNTDOWN' | 'RUNNING' | 'RESULT'

export function useContestSession() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('NO_SESSION')
  const [session, setSession] = useState<ContestSession | null>(null)
  const [startResponse, setStartResponse] = useState<StartContestResponse | null>(null)
  const [problemStatuses, setProblemStatuses] = useState<RefreshProblemStatus[]>([])
  const [endResult, setEndResult] = useState<EndContestResponse | null>(null)
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
        const stored = localStorage.getItem(STARTS_AT_KEY)
        const duration = s.duration_in_min
        if (stored) {
          const startsAtMs = parseInt(stored, 10)
          const endMs = startsAtMs + duration * 60 * 1000
          const now = Date.now()
          if (now >= endMs) {
            const res = await endSession()
            setEndResult(res)
            setPhase('RESULT')
            localStorage.removeItem(STARTS_AT_KEY)
          } else {
            setStartResponse({ session_id: s.id, status: 'RUNNING', starts_at: Math.floor(startsAtMs / 1000), duration_in_min: duration })
            setPhase('RUNNING')
            const statuses = await refreshStatus()
            setProblemStatuses(statuses)
          }
        } else {
          setPhase('REVIEW')
        }
      } else if (s.status === 'FINISHED') {
        setPhase('NO_SESSION')
        setSession(null)
      }
    } catch {
      setPhase('NO_SESSION')
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  useEffect(() => {
    if (phase !== 'RUNNING') return
    const id = setInterval(async () => {
      try {
        const statuses = await refreshStatus()
        setProblemStatuses(statuses)
      } catch {
        // ignore
      }
    }, 30000)
    return () => clearInterval(id)
  }, [phase])

  const create = useCallback(
    async (level: number, theme: string, durationInMin: number) => {
      setError(null)
      try {
        const s = await createSession(level, theme, durationInMin)
        setSession(s)
        setPhase('REVIEW')
      } catch (err: unknown) {
        const d = err && typeof err === 'object' && 'detail' in err ? (err as { detail: string }).detail : 'Failed to create session'
        setError(String(d))
        throw err
      }
    },
    []
  )

  const start = useCallback(async () => {
    setError(null)
    try {
      const res = await startSession()
      setStartResponse(res)
      localStorage.setItem(STARTS_AT_KEY, String(res.starts_at * 1000))
      setPhase('COUNTDOWN')
    } catch (err: unknown) {
      const d = err && typeof err === 'object' && 'detail' in err ? (err as { detail: string }).detail : 'Failed to start'
      setError(String(d))
      throw err
    }
  }, [])

  const onCountdownExpire = useCallback(async () => {
    setPhase('RUNNING')
    try {
      const statuses = await refreshStatus()
      setProblemStatuses(statuses)
    } catch {
      setProblemStatuses([])
    }
  }, [])

  const refresh = useCallback(async () => {
    if (phase !== 'RUNNING') return
    try {
      const statuses = await refreshStatus()
      setProblemStatuses(statuses)
    } catch {
      // ignore
    }
  }, [phase])

  const end = useCallback(async () => {
    setError(null)
    try {
      const res = await endSession()
      setEndResult(res)
      setPhase('RESULT')
      localStorage.removeItem(STARTS_AT_KEY)
    } catch (err: unknown) {
      const d = err && typeof err === 'object' && 'detail' in err ? (err as { detail: string }).detail : 'Failed to end contest'
      setError(String(d))
      throw err
    }
  }, [])

  const dismissResult = useCallback(() => {
    setEndResult(null)
    setSession(null)
    setStartResponse(null)
    setProblemStatuses([])
    setPhase('NO_SESSION')
    loadSession()
  }, [loadSession])

  return {
    phase,
    session,
    startResponse,
    problemStatuses,
    endResult,
    loading,
    error,
    create,
    start,
    onCountdownExpire,
    refresh,
    end,
    dismissResult,
    reload: loadSession,
  }
}
