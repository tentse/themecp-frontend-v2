import { useEffect, useState } from 'react'
import { getHistory } from '@/api/contestSession'
import type { ContestHistoryItem, ProblemDetail, ProblemStatus } from '@/api/types'
import { buildCodeforcesUrl } from '@/utils/codeforces'
import { getRatingTextColor } from '@/utils/rating'
import { useProfileView } from '@/hooks/useProfileView'

function problemStatusLabel(status: ProblemStatus, solvedInMin: number | null | undefined): string {
  if (status === 'SOLVED') {
    if (solvedInMin != null && Number.isFinite(solvedInMin)) return `${solvedInMin} min`
    return 'SOLVED'
  }
  return '—'
}

function ProblemCell(props: Readonly<{
  problem: ProblemDetail
  status: ProblemStatus
  solvedInMin?: number | null
}>) {
  const bg = props.status === 'SOLVED' ? '#D4EDC9' : '#FFE3E3'
  return (
    <td className="border-2 border-black px-3 py-1.5" style={{ backgroundColor: bg }}>
      <a
        href={buildCodeforcesUrl(props.problem.contestId, props.problem.index)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-blue-800"
      >
        {props.problem.rating}
      </a>
      <div className="mt-0.5 text-xs font-bold text-gray-700">
        {problemStatusLabel(props.status, props.solvedInMin)}
      </div>
    </td>
  )
}

export default function ContestHistoryPage() {
  const { viewedUserId } = useProfileView()
  const [items, setItems] = useState<ContestHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [loading, setLoading] = useState(true)
  const limit = 50

  // Reset paging when switching to a different user's history.
  useEffect(() => { setSkip(0) }, [viewedUserId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getHistory(skip, limit, viewedUserId).then((res) => {
      if (!cancelled) {
        setItems(res.items)
        setTotal(res.total)
      }
    }).catch(() => {
      if (!cancelled) {
        setItems([])
        setTotal(0)
      }
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [skip, limit, viewedUserId])

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Contest History</h2>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
        </div>
      ) : (
        <div className="p-4 sm:p-6 md:p-8 nb-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm font-bold">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">#</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">Date</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">Theme</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">Level</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">P1</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">P2</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">P3</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">P4</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">Perf</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">Rating</th>
                  <th className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5 text-left font-bold">Δ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.session_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5">{skip + idx + 1}</td>
                    <td className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5">{item.date}</td>
                    <td className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5">{item.theme}</td>
                    <td className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5">{item.level}</td>
                    <ProblemCell problem={item.p1} status={item.p1_status} solvedInMin={item.p1_solved_in_min} />
                    <ProblemCell problem={item.p2} status={item.p2_status} solvedInMin={item.p2_solved_in_min} />
                    <ProblemCell problem={item.p3} status={item.p3_status} solvedInMin={item.p3_solved_in_min} />
                    <ProblemCell problem={item.p4} status={item.p4_status} solvedInMin={item.p4_solved_in_min} />
                    <td className="border-2 border-black px-3 py-1.5 font-bold" style={{ color: getRatingTextColor(item.performance) }}>~{item.performance}</td>
                    <td className="border-2 border-black px-2 py-1 sm:px-3 sm:py-1.5">{item.rating}</td>
                    <td className="border-2 border-black px-3 py-1.5 font-bold" style={{ color: item.rating_delta >= 0 ? 'green' : 'red' }}>
                      {item.rating_delta >= 0 ? '+' : ''}{item.rating_delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSkip((s) => Math.max(0, s - limit))}
              disabled={skip === 0}
              className="w-full sm:w-auto rounded-[10px] border-2 border-black px-5 py-2 hover:bg-gray-50 active:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-150 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setSkip((s) => s + limit)}
              disabled={skip + limit >= total}
              className="w-full sm:w-auto rounded-[10px] border-2 border-black px-5 py-2 hover:bg-gray-50 active:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-150 cursor-pointer"
            >
              Next
            </button>
            <span className="py-2 text-gray-600">
              {skip + 1}-{Math.min(skip + limit, total)} of {total}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
