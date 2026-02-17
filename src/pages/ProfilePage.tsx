import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getHistory } from '@/api/contestSession'
import type { ContestHistoryItem } from '@/api/types'
import AddHandle from '@/components/AddHandle'
import RatingGraph from '@/components/RatingGraph'
import ThemePieChart from '@/components/PieChart'
import Donation from '@/components/Donation'
import ratingPic from '@/assets/rating.png'
import star from '@/assets/star.png'
import mail from '@/assets/mail.png'
import { getRatingColor } from '@/utils/rating'

export default function ProfilePage() {
  const { user } = useAuth()
  const [contestHistory, setContestHistory] = useState<ContestHistoryItem[]>([])
  const [cfData, setCfData] = useState<{ date: string; rating: number }[]>([])
  const [showCfGraph, setShowCfGraph] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await getHistory(0, 100)
        if (!cancelled) setContestHistory(res.items)
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!showCfGraph || !user?.codeforces_handle) {
      setCfData([])
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(
          `https://codeforces.com/api/user.rating?handle=${user.codeforces_handle}`
        )
        const json = await res.json()
        if (!cancelled && json.result) {
          const data = json.result.map((r: { ratingUpdateTimeSeconds: number; newRating: number }) => {
            const d = new Date(r.ratingUpdateTimeSeconds * 1000)
            const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            return { date, rating: r.newRating }
          })
          setCfData(data)
        }
      } catch {
        if (!cancelled) setCfData([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [showCfGraph, user?.codeforces_handle])

  if (!user) return <div className="p-8">Loading...</div>

  const rating = user.last_contest_rating ?? 0
  const maxRating = user.max_contest_rating ?? 0
  const bestPerf = user.best_performance ?? 0

  return (
    <div>
      <div className="space-y-2 mb-8">
        <p style={{ color: getRatingColor(rating) }} className="text-xl">
          {user.rating_label}
        </p>
        {user.codeforces_handle ? (
          <p className="text-3xl font-bold" style={{ color: getRatingColor(rating) }}>
            {user.codeforces_handle}
          </p>
        ) : (
          <AddHandle />
        )}
        <p className="flex items-center gap-2">
          <img src={ratingPic} alt="" className="h-5 w-5" />
          Contest Rating:{' '}
          <span style={{ color: getRatingColor(rating) }}>{user.last_contest_rating ?? '—'}</span>
          <span className="text-sm text-gray-600">
            (max. {user.rating_label}, {maxRating})
          </span>
        </p>
        <p className="flex items-center gap-2">
          <img src={star} alt="" className="h-5 w-5" />
          Best Performance: <span style={{ color: getRatingColor(bestPerf) }}>{bestPerf || '—'}</span>
        </p>
        <p className="flex items-center gap-2">
          <img src={star} alt="" className="h-5 w-5" />
          Contest attempts: {user.contest_attempts}
        </p>
        <p className="flex items-center gap-2">
          <img src={mail} alt="" className="h-5 w-5" />
          Email: {user.email}
        </p>
      </div>

      <div className="mb-8">
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={showCfGraph}
            onChange={(e) => setShowCfGraph(e.target.checked)}
          />
          Plot CF rating graph
        </label>
        {historyLoading ? (
          <p>Loading chart...</p>
        ) : (
          <RatingGraph contestHistory={contestHistory} cfData={showCfGraph ? cfData : []} />
        )}
      </div>

      <div className="mb-8">
        {historyLoading ? (
          <p>Loading...</p>
        ) : (
          <ThemePieChart contestHistory={contestHistory} />
        )}
      </div>

      <Donation />
    </div>
  )
}
