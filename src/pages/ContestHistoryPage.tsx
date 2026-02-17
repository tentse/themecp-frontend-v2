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
    <div>
      <h2 className="text-xl font-bold mb-4">Contest History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">#</th>
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Theme</th>
                  <th className="border border-gray-300 p-2">Level</th>
                  <th className="border border-gray-300 p-2">P1</th>
                  <th className="border border-gray-300 p-2">P2</th>
                  <th className="border border-gray-300 p-2">P3</th>
                  <th className="border border-gray-300 p-2">P4</th>
                  <th className="border border-gray-300 p-2">Solved</th>
                  <th className="border border-gray-300 p-2">Perf</th>
                  <th className="border border-gray-300 p-2">Rating</th>
                  <th className="border border-gray-300 p-2">Δ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 p-2">{skip + idx + 1}</td>
                    <td className="border border-gray-300 p-2">{item.date}</td>
                    <td className="border border-gray-300 p-2">{item.theme}</td>
                    <td className="border border-gray-300 p-2">{item.level}</td>
                    <td className="border border-gray-300 p-2" style={{ backgroundColor: getRatingColor(item.p1.rating) }}>
                      <a href={buildCodeforcesUrl(item.p1.contestID, item.p1.index)} target="_blank" rel="noopener noreferrer" className="underline">
                        {item.p1.rating}
                      </a>
                    </td>
                    <td className="border border-gray-300 p-2" style={{ backgroundColor: getRatingColor(item.p2.rating) }}>
                      <a href={buildCodeforcesUrl(item.p2.contestID, item.p2.index)} target="_blank" rel="noopener noreferrer" className="underline">
                        {item.p2.rating}
                      </a>
                    </td>
                    <td className="border border-gray-300 p-2" style={{ backgroundColor: getRatingColor(item.p3.rating) }}>
                      <a href={buildCodeforcesUrl(item.p3.contestID, item.p3.index)} target="_blank" rel="noopener noreferrer" className="underline">
                        {item.p3.rating}
                      </a>
                    </td>
                    <td className="border border-gray-300 p-2" style={{ backgroundColor: getRatingColor(item.p4.rating) }}>
                      <a href={buildCodeforcesUrl(item.p4.contestID, item.p4.index)} target="_blank" rel="noopener noreferrer" className="underline">
                        {item.p4.rating}
                      </a>
                    </td>
                    <td className="border border-gray-300 p-2">{item.solved_count}</td>
                    <td className="border border-gray-300 p-2 font-medium" style={{ color: getRatingColor(item.performance) }}>~{item.performance}</td>
                    <td className="border border-gray-300 p-2">{item.rating_after}</td>
                    <td className="border border-gray-300 p-2 font-medium" style={{ color: item.rating_delta >= 0 ? 'green' : 'red' }}>
                      {item.rating_delta >= 0 ? '+' : ''}{item.rating_delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setSkip((s) => Math.max(0, s - limit))}
              disabled={skip === 0}
              className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setSkip((s) => s + limit)}
              disabled={skip + limit >= total}
              className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
            <span className="py-2 text-gray-600">
              {skip + 1}-{Math.min(skip + limit, total)} of {total}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
