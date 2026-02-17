import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLevel } from '@/contexts/LevelContext'
import { useContestSession } from '@/hooks/useContestSession'
import { buildCodeforcesUrl } from '@/utils/codeforces'
import { getRatingColor } from '@/utils/rating'
import { THEME_TAGS } from '@/constants/tags'
import CountdownTimer from '@/components/CountdownTimer'

export default function ContestPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { levels } = useLevel()
  const {
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
  } = useContestSession()

  const [selectedLevel, setSelectedLevel] = useState<number>(levels[0]?.level ?? 20)
  const [selectedTheme, setSelectedTheme] = useState<string>('greedy')
  const [creating, setCreating] = useState(false)
  const [starting, setStarting] = useState(false)
  const [ending, setEnding] = useState(false)
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)

  const levelObj = levels.find((l) => l.level === selectedLevel)
  const duration = levelObj?.duration_in_min ?? 120

  const suggestedLevel = (() => {
    const rating = user?.last_contest_rating ?? 1400
    let best = levels[0]
    let bestDiff = Infinity
    for (const l of levels) {
      const d = Math.abs(l.performance - rating)
      if (d < bestDiff) {
        bestDiff = d
        best = l
      }
    }
    return best?.level ?? 20
  })()

  const runCreate = async () => {
    if (!levelObj) {
      alert('Please select a contest level')
      return
    }
    setCreating(true)
    try {
      await create(selectedLevel, selectedTheme, duration)
    } finally {
      setCreating(false)
    }
  }

  const runStart = async () => {
    if (!window.confirm("Once contest started you can't stop the contest. ARE YOU READY TO START?")) return
    setStarting(true)
    try {
      await start()
    } finally {
      setStarting(false)
    }
  }

  if (!user?.codeforces_handle) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm text-center">
        <p className="text-red-600 font-medium">Please add your Codeforces handle first.</p>
        <button onClick={() => navigate('/profile')} className="mt-4 rounded-xl bg-black px-6 py-2 text-white hover:bg-gray-800 active:scale-95 transition-all cursor-pointer">
          Go to Profile
        </button>
      </div>
    )
  }

  if (loading && phase === 'NO_SESSION') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (phase === 'NO_SESSION') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
        <div className="mb-4">
          <label className="block font-medium mb-1">Contest Level</label>
          <input
            type="number"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(Number(e.target.value))}
            className="rounded-lg border border-gray-200 px-4 py-3 w-full sm:w-28 focus:ring-1 focus:ring-black focus:outline-none"
          />
        </div>
        <p className="text-sm text-gray-600 mb-2">Suggested level: {suggestedLevel}</p>
        <p className="text-sm text-red-600 mb-4">
          <button onClick={() => navigate('/levels')} className="underline cursor-pointer">Level sheet</button> for level details
        </p>
        <div className="mb-4">
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="w-full sm:w-auto rounded-lg border border-gray-200 px-4 py-3 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-black focus:outline-none transition-colors cursor-pointer"
          >
            Theme: {selectedTheme}
          </button>
          {showThemeDropdown && (
            <div className="mt-2 border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto bg-white">
              {THEME_TAGS.map((t) => (
                <div
                  key={t}
                  onClick={() => { setSelectedTheme(t); setShowThemeDropdown(false) }}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors ${selectedTheme === t ? 'bg-gray-200 font-medium' : ''}`}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="mb-4">Duration: {duration} min</p>
        <button
          onClick={runCreate}
          disabled={creating}
          className="w-full sm:w-auto rounded-xl bg-black px-6 py-3 text-white font-medium hover:bg-gray-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {creating ? 'Creating...' : 'Create Contest'}
        </button>
      </div>
    )
  }

  if (phase === 'REVIEW' && session) {
    const problems = [session.p1, session.p2, session.p3, session.p4]
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Review Problems</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {problems.map((p, i) => (
            <a
              key={i}
              href={buildCodeforcesUrl(p.contestID, p.index)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border p-4 text-center font-medium hover:bg-gray-50 cursor-pointer"
              style={{ backgroundColor: getRatingColor(p.rating) }}
            >
              Problem {i + 1}: {p.rating}
            </a>
          ))}
        </div>
        <p className="mb-4">Duration: {session.duration_in_min} min</p>
        <button
          onClick={runStart}
          disabled={starting}
          className="w-full sm:w-auto rounded-xl bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {starting ? 'Starting...' : 'Start Contest'}
        </button>
      </div>
    )
  }

  if (phase === 'COUNTDOWN' && startResponse) {
    const targetMs = startResponse.starts_at * 1000
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Contest starts in</h2>
        <CountdownTimer targetTimestamp={targetMs} onExpire={onCountdownExpire} className="text-4xl font-mono" />
      </div>
    )
  }

  if (phase === 'RUNNING' && session && startResponse) {
    const problems = [session.p1, session.p2, session.p3, session.p4]
    const endMs = startResponse.starts_at * 1000 + session.duration_in_min * 60 * 1000
    const statusMap = new Map(problemStatuses.map((s) => [s.problem_number, s]))

    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
        <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3 sm:p-4 mb-6">
          <div className="text-red-600 font-medium mb-2">NOTE:</div>
          <ul className="text-sm space-y-1">
            <li>1. Solve problems in order (P1 before P2, etc.).</li>
            <li>2. Press Refresh to update solve status.</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <span className="text-lg sm:text-xl font-mono">
            Time: <CountdownTimer targetTimestamp={endMs} onExpire={end} />
          </span>
          <button
            onClick={refresh}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            Refresh
          </button>
        </div>
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-100 p-2 sm:p-3 w-12 text-left font-semibold text-sm sm:text-base">#</th>
              <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold text-sm sm:text-base">Problem</th>
              <th className="border border-gray-100 p-2 sm:p-3 w-20 sm:w-24 text-left font-semibold text-sm sm:text-base">Rating</th>
              <th className="border border-gray-100 p-2 sm:p-3 w-24 sm:w-28 text-left font-semibold text-sm sm:text-base">Status</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p, i) => {
              const num = i + 1
              const status = statusMap.get(num)
              const solved = status?.state === 'SOLVED'
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-100 p-2 sm:p-3 text-sm sm:text-base">{num}</td>
                  <td className="border border-gray-100 p-2 sm:p-3 text-sm sm:text-base">
                    <a href={buildCodeforcesUrl(p.contestID, p.index)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                      Problem {String.fromCharCode(64 + num)}
                    </a>
                  </td>
                  <td className="border border-gray-100 p-2 sm:p-3 font-medium text-sm sm:text-base" style={{ backgroundColor: getRatingColor(p.rating) }}>
                    {p.rating}
                  </td>
                  <td className="border border-gray-100 p-2 sm:p-3 font-medium text-sm sm:text-base" style={{ backgroundColor: solved ? '#D4EDC9' : '#FFE3E3' }}>
                    {solved ? 'Accepted' : 'Pending'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="mt-4">
          <button
            onClick={async () => { setEnding(true); await end(); setEnding(false) }}
            disabled={ending}
            className="rounded-xl bg-red-600 px-6 py-2 text-white hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            End Contest
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'RESULT' && endResult) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Contest Over</h2>
        <div className="space-y-2">
          <p>Solved: {endResult.solved_count}/4</p>
          <p>Performance: {endResult.performance}</p>
          <p>Rating: {endResult.rating_before} → {endResult.rating_after}</p>
          <p style={{ color: endResult.rating_delta >= 0 ? 'green' : 'red' }}>
            Δ {endResult.rating_delta >= 0 ? '+' : ''}{endResult.rating_delta}
          </p>
        </div>
        <button
          onClick={dismissResult}
          className="mt-6 w-full sm:w-auto rounded-xl bg-black px-6 py-2 text-white hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
        >
          Back to Contest
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
    </div>
  )
}
