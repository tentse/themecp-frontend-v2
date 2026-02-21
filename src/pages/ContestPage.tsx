import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLevel } from '@/contexts/LevelContext'
import { useContestSession } from '@/hooks/useContestSession'
import { buildCodeforcesUrl } from '@/utils/codeforces'
import { getRatingColor } from '@/utils/rating'
import type { ContestSessionOutput, ProblemDetail } from '@/api/types'

type Phase = 'NO_SESSION' | 'REVIEW'

function RatingBox({ label, rating }: Readonly<{ label: string; rating: number }>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 py-4 shadow-sm flex flex-col min-w-0">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div
        className="mt-2 rounded-lg px-3 py-2.5 text-center font-mono text-lg font-semibold flex-1 flex items-center justify-center"
        style={{ backgroundColor: getRatingColor(rating) }}
      >
        {rating}
      </div>
    </div>
  )
}

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

function NoHandleGate({ onGoProfile }: Readonly<{ onGoProfile: () => void }>) {
  return (
    <PageCard>
      <div className="text-center">
        <p className="text-red-600 font-medium">Please add your Codeforces handle first.</p>
        <button
          onClick={onGoProfile}
          className="mt-4 rounded-xl bg-black px-6 py-2 text-white hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
        >
          Go to Profile
        </button>
      </div>
    </PageCard>
  )
}

function ErrorCard({ error }: Readonly<{ error: string }>) {
  return (
    <PageCard>
      <p className="text-red-600">{error}</p>
    </PageCard>
  )
}

function NoSessionView(props: Readonly<{
  levelsLoaded: boolean
  selectedLevel: number | ''
  onSelectedLevelChange: (level: number | '') => void
  suggestedLevel: number
  selectedTheme: string
  onSelectedThemeChange: (theme: string) => void
  duration: number | undefined
  isLevelValid: boolean
  levelObj: { p1_rating: number; p2_rating: number; p3_rating: number; p4_rating: number } | undefined
  creating: boolean
  onCreate: () => void
}>) {
  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (v === '') props.onSelectedLevelChange('')
    else {
      const n = Number(v)
      if (!Number.isNaN(n)) props.onSelectedLevelChange(n)
    }
  }

  return (
    <PageCard>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Create contest</h2>
          <p className="mt-1 text-sm text-gray-600">
            Pick a level, preview the expected problem ratings, then generate your contest.
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Suggested level:{' '}
          <span className="font-mono font-semibold text-gray-900">{props.suggestedLevel}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <label htmlFor="contest-level" className="block text-sm font-medium text-gray-700">
            Contest level
          </label>
          <input
            id="contest-level"
            type="number"
            inputMode="numeric"
            value={props.selectedLevel === '' ? '' : props.selectedLevel}
            onChange={handleLevelChange}
            className="mt-2 w-full max-w-xs rounded-xl border border-gray-200 px-4 py-3 focus:ring-1 focus:ring-black focus:outline-none"
            placeholder="e.g. 20"
          />
          <div className="mt-2 text-sm text-gray-600">
            Refer the contest level sheet for details.{' '}
            <Link to="/levels" className="font-medium text-blue-600 underline hover:text-blue-800">
              Level sheet
            </Link>
          </div>
          {props.levelsLoaded && !props.isLevelValid && props.selectedLevel !== '' && (
            <div className="mt-2 text-sm text-red-600">
              Level not found. Please enter a valid level from the level sheet.
            </div>
          )}
        </div>

        <div>
          <div className="block text-sm font-medium text-gray-700">Theme</div>
          <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 max-w-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="mixed"
                checked={props.selectedTheme === 'mixed'}
                onChange={() => props.onSelectedThemeChange('mixed')}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-900">Mixed</span>
              <span className="text-xs text-gray-500">(only option for now)</span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-700">Expected problem ratings</div>
              <div className="mt-1 text-xs text-gray-500">Preview based on the selected contest level preset.</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 shrink-0 min-w-[140px]">
              <div className="text-xs font-medium text-gray-600">Duration</div>
              <div className="font-mono text-lg font-semibold text-gray-900">{props.duration == null ? '—' : `${props.duration} min`}</div>
            </div>
          </div>

          {props.levelObj ? (
            <div className="mt-4 grid grid-cols-4 gap-3 w-full">
              <RatingBox label="P1" rating={props.levelObj.p1_rating} />
              <RatingBox label="P2" rating={props.levelObj.p2_rating} />
              <RatingBox label="P3" rating={props.levelObj.p3_rating} />
              <RatingBox label="P4" rating={props.levelObj.p4_rating} />
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-600">
              Enter a valid level to preview expected ratings.
            </div>
          )}
        </div>

        <button
          onClick={props.onCreate}
          disabled={props.creating || !props.isLevelValid}
          className="w-full max-w-xs rounded-xl bg-black px-6 py-3 text-white font-medium hover:bg-gray-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {props.creating ? 'Generating...' : 'Generate contest'}
        </button>
      </div>
    </PageCard>
  )
}

function ReviewView(props: Readonly<{
  session: ContestSessionOutput
  starting: boolean
  onStart: () => void
  onReRoll: (problemNumber: number) => void
  reRollingProblem: number | null
  onRegenerate: () => void
  regenerating: boolean
}>) {
  const problems: ProblemDetail[] = [props.session.p1, props.session.p2, props.session.p3, props.session.p4]
  return (
    <PageCard>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Review problems</h2>
          <p className="mt-1 text-sm text-gray-600">
            Preview the generated problems. When you’re ready, start the contest.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
            Level: <span className="font-mono">{props.session.level}</span>
          </span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
            Theme: <span className="font-mono">{props.session.theme}</span>
          </span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
            Duration: <span className="font-mono">{props.session.duration_in_min}m</span>
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {problems.map((p, i) => {
          const label = `P${i + 1}`
          const href = buildCodeforcesUrl(p.contestId, p.index)
          return (
            <div
              key={`${p.contestId}-${p.index}-${i}`}
              className="flex flex-row flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
            >
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 min-w-[140px] flex items-start justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-medium text-gray-700">{label}</div>
                  <div className="mt-1 font-mono text-xs text-gray-500">
                    {p.contestId}/{p.index}
                  </div>
                </div>
                <div
                  className="rounded-xl px-3 py-2 font-mono text-lg font-bold"
                  style={{ backgroundColor: getRatingColor(p.rating) }}
                >
                  {p.rating}
                </div>
              </a>
              <button
                type="button"
                onClick={() => props.onReRoll(i + 1)}
                disabled={props.reRollingProblem !== null}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {props.reRollingProblem === i + 1 ? 'Re-rolling...' : 'Re-roll'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => props.onRegenerate()}
            disabled={props.regenerating || props.starting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {props.regenerating ? 'Regenerating...' : 'Regenerate contest'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Contest starts 15 seconds after you press start.
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
        <button
          onClick={props.onStart}
          disabled={props.starting}
          className="w-full sm:w-auto rounded-xl bg-black px-6 py-3 text-white font-medium hover:bg-gray-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {props.starting ? 'Starting...' : 'Start contest'}
        </button>
      </div>
    </PageCard>
  )
}

export default function ContestPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { levels } = useLevel()
  const { phase, session, loading, error, create, start, reRoll, reRollingProblem, discardSession, discarding } = useContestSession()

  const [selectedLevel, setSelectedLevel] = useState<number | ''>('')
  const [selectedTheme, setSelectedTheme] = useState<string>('mixed')
  const [creating, setCreating] = useState(false)
  const [starting, setStarting] = useState(false)

  const levelObj = useMemo(
    () => (selectedLevel === '' ? undefined : levels.find((l) => l.level === selectedLevel)),
    [levels, selectedLevel]
  )
  const duration = levelObj?.duration_in_min
  const isLevelValid = !!levelObj

  const suggestedLevel = useMemo(() => {
    if (levels.length === 0) return 20
    const rating = user?.rating ?? 1400
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
  }, [levels, user?.rating])

  const runCreate = async () => {
    if (!isLevelValid || !levelObj) return
    setCreating(true)
    try {
      await create(levelObj.level, selectedTheme)
    } finally {
      setCreating(false)
    }
  }

  const runStart = async () => {
    if (!globalThis.confirm("ARE YOU READY TO START?")) return
    setStarting(true)
    try {
      await start()
    } finally {
      setStarting(false)
    }
  }

  const runRegenerate = async () => {
    if (!globalThis.confirm('Discard this contest and choose a new level?')) return
    try {
      await discardSession()
    } catch {
      // Error already set in hook; ErrorCard will show
    }
  }

  if (!user?.codeforces_handle) {
    return <NoHandleGate onGoProfile={() => navigate('/profile')} />
  }

  if (error) {
    return <ErrorCard error={error} />
  }

  if (loading) {
    return <Spinner />
  }

  if (phase === 'NO_SESSION') {
    return (
      <NoSessionView
        levelsLoaded={levels.length > 0}
        selectedLevel={selectedLevel}
        onSelectedLevelChange={setSelectedLevel}
        suggestedLevel={suggestedLevel}
        selectedTheme={selectedTheme}
        onSelectedThemeChange={setSelectedTheme}
        duration={duration}
        isLevelValid={isLevelValid}
        levelObj={levelObj}
        creating={creating}
        onCreate={runCreate}
      />
    )
  }

  if (phase === 'REVIEW' && session) {
    return (
      <ReviewView
        session={session}
        starting={starting}
        onStart={runStart}
        onReRoll={reRoll}
        reRollingProblem={reRollingProblem}
        onRegenerate={runRegenerate}
        regenerating={discarding}
      />
    )
  }

  return <Spinner />
}
