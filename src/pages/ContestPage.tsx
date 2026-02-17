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
      <div className="p-8 text-center">
        <p className="text-red-600 font-medium">Please add your Codeforces handle first.</p>
        <button onClick={() => navigate('/profile')} className="mt-4 rounded bg-pink-500 px-4 py-2 text-white">
          Go to Profile
        </button>
      </div>
    )
  }

  if (loading && phase === 'NO_SESSION') {
    return <div className="p-8 text-center">Loading...</div>
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <label className="block font-medium mb-1">Contest Level</label>
          <input
            type="number"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(Number(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2 w-24"
          />
        </div>
        <p className="text-sm text-gray-600 mb-2">Suggested level: {suggestedLevel}</p>
        <p className="text-sm text-red-600 mb-4">
          <button onClick={() => navigate('/levels')} className="underline">Level sheet</button> for level details
        </p>
        <div className="mb-4">
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="rounded border border-gray-300 px-4 py-2 bg-white"
          >
            Theme: {selectedTheme}
          </button>
          {showThemeDropdown && (
            <div className="mt-2 border border-gray-200 rounded max-h-48 overflow-y-auto">
              {THEME_TAGS.map((t) => (
                <div
                  key={t}
                  onClick={() => { setSelectedTheme(t); setShowThemeDropdown(false) }}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedTheme === t ? 'bg-pink-100' : ''}`}
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
          className="rounded bg-pink-500 px-6 py-3 text-white font-medium hover:bg-pink-600 disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Contest'}
        </button>
      </div>
    )
  }

  if (phase === 'REVIEW' && session) {
    const problems = [session.p1, session.p2, session.p3, session.p4]
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Review Problems</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {problems.map((p, i) => (
            <a
              key={i}
              href={buildCodeforcesUrl(p.contestID, p.index)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border p-4 text-center font-medium hover:bg-gray-50"
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
          className="rounded bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {starting ? 'Starting...' : 'Start Contest'}
        </button>
      </div>
    )
  }

  if (phase === 'COUNTDOWN' && startResponse) {
    const targetMs = startResponse.starts_at * 1000
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">Contest starts in</h2>
        <CountdownTimer targetTimestamp={targetMs} onExpire={onCountdownExpire} className="text-4xl font-mono" />
      </div>
    )
  }

  if (phase === 'RUNNING' && session && startResponse) {
    const problems = [session.p1, session.p2, session.p3, session.p4]
    const endMs = startResponse.starts_at * 1000 + session.duration_in_min * 60 * 1000
    const statusMap = new Map(problemStatuses.map((s) => [s.problem_number, s]))

    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded border-2 border-black p-4 mb-4">
          <div className="text-red-600 font-medium mb-2">NOTE:</div>
          <ul className="text-sm space-y-1">
            <li>1. Solve problems in order (P1 before P2, etc.).</li>
            <li>2. Press Refresh to update solve status.</li>
          </ul>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-mono">
            Time: <CountdownTimer targetTimestamp={endMs} onExpire={end} />
          </span>
          <button
            onClick={refresh}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 w-12">#</th>
              <th className="border border-gray-300 p-2">Problem</th>
              <th className="border border-gray-300 p-2 w-24">Rating</th>
              <th className="border border-gray-300 p-2 w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p, i) => {
              const num = i + 1
              const status = statusMap.get(num)
              const solved = status?.state === 'SOLVED'
              return (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{num}</td>
                  <td className="border border-gray-300 p-2">
                    <a href={buildCodeforcesUrl(p.contestID, p.index)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Problem {String.fromCharCode(64 + num)}
                    </a>
                  </td>
                  <td className="border border-gray-300 p-2" style={{ backgroundColor: getRatingColor(p.rating) }}>
                    {p.rating}
                  </td>
                  <td className="border border-gray-300 p-2" style={{ backgroundColor: solved ? '#D4EDC9' : '#FFE3E3' }}>
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
            className="rounded bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            End Contest
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'RESULT' && endResult) {
    return (
      <div className="max-w-md mx-auto rounded border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold mb-4">Contest Over</h2>
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
          className="mt-6 rounded bg-pink-500 px-6 py-2 text-white hover:bg-pink-600"
        >
          Back to Contest
        </button>
      </div>
    )
  }

  return <div className="p-8">Loading...</div>
}
