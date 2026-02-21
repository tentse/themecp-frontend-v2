import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveSession, refreshStatus, endSession } from '@/api/contestSession'
import type {
  ContestSessionOutput,
  ContestSessionProblemsStatus,
  ProblemDetail,
  ProblemStatus,
} from '@/api/types'
import { buildCodeforcesUrl } from '@/utils/codeforces'
import { getRatingColor } from '@/utils/rating'
import CountdownTimer from '@/components/CountdownTimer'
import { useAuth } from '@/contexts/AuthContext'

const REFRESH_COOLDOWN_MS = 5000

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
    </div>
  )
}

function PageCard({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 rounded-2xl bg-white shadow-sm">
      {children}
    </div>
  )
}

function statusLabel(s: ProblemStatus): string {
  return s === 'SOLVED' ? 'Accepted' : 'Pending'
}

export default function ContestStartPage() {
  const navigate = useNavigate()
  const { refetchUser } = useAuth()
  const [session, setSession] = useState<ContestSessionOutput | null>(null)
  const [problemsStatus, setProblemsStatus] = useState<ContestSessionProblemsStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshCooldownUntil, setRefreshCooldownUntil] = useState(0)
  const [ending, setEnding] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const s = await getActiveSession()
      setSession(s)
      if (s.status === 'REVIEW') {
        navigate('/contest', { replace: true })
        return
      }
      if (s.status === 'RUNNING' && s.starts_at != null && s.ends_at != null) {
        const status = await refreshStatus(s.id)
        setProblemsStatus(status)
      }
    } catch (err: unknown) {
      const apiErr = err as { status?: number }
      if (apiErr.status === 404) {
        navigate('/contest', { replace: true })
        return
      }
      setError(
        err && typeof err === 'object' && 'detail' in err
          ? String((err as { detail: string }).detail)
          : 'Failed to load contest'
      )
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  // Background poll every 30s when running
  useEffect(() => {
    if (session?.status !== 'RUNNING' || !session?.ends_at) return
    const id = setInterval(async () => {
      try {
        const status = await refreshStatus(session.id)
        setProblemsStatus(status)
      } catch {
        // ignore
      }
    }, 300000)
    return () => clearInterval(id)
  }, [session?.id, session?.status, session?.ends_at])

  const handleRefresh = useCallback(async () => {
    if (!session || session.status !== 'RUNNING') return
    const now = Date.now()
    if (now < refreshCooldownUntil) return
    setRefreshing(true)
    try {
      const status = await refreshStatus(session.id)
      setProblemsStatus(status)
      setRefreshCooldownUntil(now + REFRESH_COOLDOWN_MS)
    } catch {
      // ignore
    } finally {
      setRefreshing(false)
    }
  }, [session, refreshCooldownUntil])

  const handleEndContest = useCallback(async () => {
    if (!session || !globalThis.confirm('End contest and submit results?')) return
    setEnding(true)
    try {
      await endSession(session.id)
      await refetchUser()
      navigate('/profile/history', { replace: true })
    } catch (err: unknown) {
      const d =
        err && typeof err === 'object' && 'detail' in err
          ? (err as { detail: string }).detail
          : 'Failed to end contest'
      setError(String(d))
    } finally {
      setEnding(false)
    }
  }, [session, navigate, refetchUser])

  // Cooldown countdown for refresh button
  const [cooldownSecs, setCooldownSecs] = useState(0)
  useEffect(() => {
    if (refreshCooldownUntil <= 0) {
      setCooldownSecs(0)
      return
    }
    const tick = () => {
      const left = Math.ceil((refreshCooldownUntil - Date.now()) / 1000)
      setCooldownSecs(Math.max(0, left))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [refreshCooldownUntil])

  if (loading || !session) {
    return <Spinner />
  }

  if (error) {
    return (
      <PageCard>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/contest')}
          className="mt-4 rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Back to Contest
        </button>
      </PageCard>
    )
  }

  if (session.status !== 'RUNNING' || session.starts_at == null || session.ends_at == null) {
    return (
      <PageCard>
        <p className="text-gray-600">No running contest. Start one from the contest page.</p>
        <button
          onClick={() => navigate('/contest')}
          className="mt-4 rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Go to Contest
        </button>
      </PageCard>
    )
  }

  const startsAtMs = session.starts_at * 1000
  const endsAtMs = session.ends_at * 1000
  const nowMs = Date.now()
  const inCountdown = nowMs < startsAtMs

  const problems: ProblemDetail[] = [session.p1, session.p2, session.p3, session.p4]
  const statuses: ProblemStatus[] = problemsStatus
    ? [
        problemsStatus.p1_status,
        problemsStatus.p2_status,
        problemsStatus.p3_status,
        problemsStatus.p4_status,
      ]
    : ['UNSOLVED', 'UNSOLVED', 'UNSOLVED', 'UNSOLVED']

  if (inCountdown) {
    return (
      <PageCard>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Contest starts in</h2>
          <CountdownTimer
            targetTimestamp={startsAtMs}
            onExpire={load}
            className="text-4xl font-mono"
          />
        </div>
      </PageCard>
    )
  }

  const refreshDisabled = refreshing || cooldownSecs > 0

  return (
    <PageCard>
      <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3 sm:p-4 mb-6">
        <div className="text-red-600 font-medium mb-2">NOTE:</div>
        <ul className="text-sm space-y-1">
          <li>1. Solve problems in order (P1 before P2, etc.).</li>
          <li>2. Press Refresh to update solve status.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <span className="text-lg sm:text-xl font-mono">
          Time: <CountdownTimer targetTimestamp={endsAtMs} onExpire={handleEndContest} />
        </span>
        <button
          onClick={handleRefresh}
          disabled={refreshDisabled}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {(() => {
            if (refreshing) return 'Refreshing...'
            if (cooldownSecs > 0) return `Refresh (${cooldownSecs}s)`
            return 'Refresh'
          })()}
        </button>
      </div>

      <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-100 p-2 sm:p-3 w-12 text-left font-semibold text-sm sm:text-base">
              #
            </th>
            <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold text-sm sm:text-base">
              Problem
            </th>
            <th className="border border-gray-100 p-2 sm:p-3 w-20 sm:w-24 text-left font-semibold text-sm sm:text-base">
              Rating
            </th>
            <th className="border border-gray-100 p-2 sm:p-3 w-24 sm:w-28 text-left font-semibold text-sm sm:text-base">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {problems.map((p, i) => {
            const num = i + 1
            const solved = statuses[i] === 'SOLVED'
            return (
              <tr key={`${p.contestId}-${p.index}`} className="hover:bg-gray-50 transition-colors">
                <td className="border border-gray-100 p-2 sm:p-3 text-sm sm:text-base">{num}</td>
                <td className="border border-gray-100 p-2 sm:p-3 text-sm sm:text-base">
                  <a
                    href={buildCodeforcesUrl(p.contestId, p.index)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Problem {String.fromCodePoint(64 + num)}
                  </a>
                </td>
                <td
                  className="border border-gray-100 p-2 sm:p-3 font-medium text-sm sm:text-base"
                  style={{ backgroundColor: getRatingColor(p.rating) }}
                >
                  {p.rating}
                </td>
                <td
                  className="border border-gray-100 p-2 sm:p-3 font-medium text-sm sm:text-base"
                  style={{
                    backgroundColor: solved ? '#D4EDC9' : '#FFE3E3',
                  }}
                >
                  {statusLabel(statuses[i])}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={handleEndContest}
          disabled={ending}
          className="rounded-xl bg-red-600 px-6 py-2 text-white hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {ending ? 'Ending...' : 'End Contest'}
        </button>
      </div>
    </PageCard>
  )
}
