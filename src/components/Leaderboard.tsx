import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLeaderboard } from '@/api/leaderboard'
import type { LeaderboardEntry } from '@/api/types'
import { getRatingLabelColor } from '@/utils/rating'

interface LeaderboardProps {
  /**
   * How many rows to show. Left undefined by default so the server decides how
   * many to return; pass a number here to ask for a specific count (1–100).
   */
  limit?: number
}

export default function Leaderboard({ limit }: Readonly<LeaderboardProps>) {
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
    <div className="p-3 sm:p-4 nb-card">
      <h3 className="mb-3 text-base sm:text-lg font-bold">Top ThemeCP&apos;r</h3>

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
        <div>
          {/* table-fixed so the handle column truncates rather than pushing the
              rating column out of the narrow sidebar. */}
          <table className="w-full table-fixed border-collapse text-xs sm:text-sm font-bold">
            <colgroup>
              {/* Rank fits "10"; Rating must fit the word "Rating" itself, which is
                  wider than any 4-digit value it holds. */}
              <col className="w-10" />
              <col />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-black px-1.5 py-2 text-left font-bold">#</th>
                <th className="border-2 border-black px-1.5 py-2 text-left font-bold">Handle</th>
                <th className="border-2 border-black px-1.5 py-2 text-right font-bold whitespace-nowrap">Rating</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const color = getRatingLabelColor(entry.rating_label)
                return (
                  <tr key={entry.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="border-2 border-black px-1.5 py-2 text-gray-600">{index + 1}</td>
                    <td className="border-2 border-black px-1.5 py-2">
                      <div className="flex items-center gap-1 min-w-0">
                        {/* Handle goes to the in-app profile; the ↗ is a SIBLING anchor to
                            Codeforces — an <a> nested in a <Link> would be invalid HTML. */}
                        <Link
                          to={`/profile/${entry.user_id}`}
                          className="truncate no-underline hover:underline"
                          style={{ color }}
                          title={`${entry.codeforces_handle} — ${entry.rating_label}`}
                        >
                          {entry.codeforces_handle}
                        </Link>
                        <a
                          href={`https://codeforces.com/profile/${entry.codeforces_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${entry.codeforces_handle} on Codeforces`}
                          aria-label={`${entry.codeforces_handle} on Codeforces`}
                          className="shrink-0 text-gray-500 hover:text-black transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </td>
                    <td className="border-2 border-black px-1.5 py-2 text-right" style={{ color }}>
                      {entry.rating}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
