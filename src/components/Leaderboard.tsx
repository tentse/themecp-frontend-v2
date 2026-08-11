import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLeaderboard } from '@/api/leaderboard'
import type { LeaderboardEntry } from '@/api/types'
import { getRatingLabelColor } from '@/utils/rating'

interface LeaderboardProps {
  /** How many rows to show. Bump to 15 or 20 here and nothing else changes. */
  limit?: number
}

export default function Leaderboard({ limit = 10 }: Readonly<LeaderboardProps>) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFailed(false)
    getLeaderboard(limit)
      .then((data) => {
        if (!cancelled) setEntries(data)
      })
      .catch(() => {
        // This renders on nearly every page — a failure must degrade to a quiet
        // note, never throw or blank the page around it.
        if (!cancelled) setFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [limit])

  return (
    <div className="p-4 nb-card">
      <h3 className="mb-3 text-lg font-bold">Leaderboard</h3>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-black" />
        </div>
      )}

      {!loading && failed && (
        <p className="text-sm text-gray-600">Leaderboard unavailable</p>
      )}

      {!loading && !failed && entries.length === 0 && (
        <p className="text-sm text-gray-600">No ranked users yet</p>
      )}

      {!loading && !failed && entries.length > 0 && (
        <ol className="list-none p-0 m-0 space-y-1">
          {entries.map((entry, index) => (
            <li key={entry.user_id} className="flex items-center gap-2 text-sm">
              {/* The row links in-app; the Codeforces link is a SIBLING anchor —
                  an <a> nested inside a <Link> would be invalid HTML. */}
              <Link
                to={`/profile/${entry.user_id}`}
                className="flex flex-1 items-center gap-2 min-w-0 no-underline text-black rounded-[5px] px-1 py-1 hover:bg-gray-100 transition-colors"
              >
                <span className="w-5 shrink-0 text-gray-600">{index + 1}</span>
                <span
                  className="flex-1 truncate font-bold"
                  style={{ color: getRatingLabelColor(entry.rating_label) }}
                  title={`${entry.codeforces_handle} — ${entry.rating_label}`}
                >
                  {entry.codeforces_handle}
                </span>
                <span
                  className="shrink-0 font-bold"
                  style={{ color: getRatingLabelColor(entry.rating_label) }}
                >
                  {entry.rating}
                </span>
              </Link>
              <a
                href={`https://codeforces.com/profile/${entry.codeforces_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`${entry.codeforces_handle} on Codeforces`}
                aria-label={`${entry.codeforces_handle} on Codeforces`}
                className="shrink-0 text-gray-500 hover:text-black transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
