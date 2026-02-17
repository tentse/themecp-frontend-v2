import { useEffect, useState } from 'react'
import { getHistory } from '@/api/contestSession'
import type { ContestHistoryItem } from '@/api/types'
import { buildCodeforcesUrl } from '@/utils/codeforces'
import { getRatingColor } from '@/utils/rating'

export default function ContestHistoryPage() {
  const [items, setItems] = useState<ContestHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [loading, setLoading] = useState(true)
  const limit = 20

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getHistory(skip, limit).then((res) => {
      if (!cancelled) {
        setItems(res.items)
        setTotal(res.total)
      }
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [skip])

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Contest History</h2>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
        </div>
      ) : (
        <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">#</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">Date</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">Theme</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">Level</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">P1</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">P2</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">P3</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">P4</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">Solved</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">Perf</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">Rating</th>
                  <th className="border border-gray-100 p-2 sm:p-3 text-left font-semibold">Δ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-100 p-2 sm:p-3">{skip + idx + 1}</td>
                    <td className="border border-gray-100 p-2 sm:p-3">{item.date}</td>
                    <td className="border border-gray-100 p-2 sm:p-3">{item.theme}</td>
                    <td className="border border-gray-100 p-2 sm:p-3">{item.level}</td>
                    <td className="border border-gray-100 p-3" style={{ backgroundColor: getRatingColor(item.p1.rating) }}>
                      <a href={buildCodeforcesUrl(item.p1.contestID, item.p1.index)} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                        {item.p1.rating}
                      </a>
                    </td>
                    <td className="border border-gray-100 p-3" style={{ backgroundColor: getRatingColor(item.p2.rating) }}>
                      <a href={buildCodeforcesUrl(item.p2.contestID, item.p2.index)} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                        {item.p2.rating}
                      </a>
                    </td>
                    <td className="border border-gray-100 p-3" style={{ backgroundColor: getRatingColor(item.p3.rating) }}>
                      <a href={buildCodeforcesUrl(item.p3.contestID, item.p3.index)} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                        {item.p3.rating}
                      </a>
                    </td>
                    <td className="border border-gray-100 p-3" style={{ backgroundColor: getRatingColor(item.p4.rating) }}>
                      <a href={buildCodeforcesUrl(item.p4.contestID, item.p4.index)} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                        {item.p4.rating}
                      </a>
                    </td>
                    <td className="border border-gray-100 p-2 sm:p-3">{item.solved_count}</td>
                    <td className="border border-gray-100 p-3 font-medium" style={{ color: getRatingColor(item.performance) }}>~{item.performance}</td>
                    <td className="border border-gray-100 p-2 sm:p-3">{item.rating_after}</td>
                    <td className="border border-gray-100 p-3 font-medium" style={{ color: item.rating_delta >= 0 ? 'green' : 'red' }}>
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
              className="w-full sm:w-auto rounded-xl border border-gray-100 px-5 py-2 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setSkip((s) => s + limit)}
              disabled={skip + limit >= total}
              className="w-full sm:w-auto rounded-xl border border-gray-100 px-5 py-2 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
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
