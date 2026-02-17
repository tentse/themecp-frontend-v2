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

  if (!user) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
    </div>
  )

  const rating = user.last_contest_rating ?? 0
  const maxRating = user.max_contest_rating ?? 0
  const bestPerf = user.best_performance ?? 0

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="space-y-3 sm:space-y-4">
        <p style={{ color: getRatingColor(rating) }} className="text-xl">
          {user.rating_label}
        </p>
        {user.codeforces_handle ? (
          <p className="text-2xl sm:text-3xl font-bold" style={{ color: getRatingColor(rating) }}>
            {user.codeforces_handle}
          </p>
        ) : (
          <AddHandle />
        )}
        <p className="flex items-center gap-2 text-sm sm:text-base">
          <img src={ratingPic} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
          Contest Rating:{' '}
          <span className="font-mono" style={{ color: getRatingColor(rating) }}>{user.last_contest_rating ?? '—'}</span>
          <span className="text-sm text-gray-600">
            (max. {user.rating_label}, <span className="font-mono">{maxRating}</span>)
          </span>
        </p>
        <p className="flex items-center gap-2 text-sm sm:text-base">
          <img src={star} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
          Best Performance: <span className="font-mono" style={{ color: getRatingColor(bestPerf) }}>{bestPerf || '—'}</span>
        </p>
        <p className="flex items-center gap-2 text-sm sm:text-base">
          <img src={star} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
          Contest attempts: <span className="font-mono">{user.contest_attempts}</span>
        </p>
        <p className="flex items-center gap-2 text-sm sm:text-base">
          <img src={mail} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
          Email: {user.email}
        </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={showCfGraph}
            onChange={(e) => setShowCfGraph(e.target.checked)}
            className="w-4 h-4 rounded border-gray-200 focus:ring-1 focus:ring-black focus:ring-offset-0"
          />
          <span>Plot CF rating graph</span>
        </label>
        {historyLoading ? (
          <p>Loading chart...</p>
        ) : (
          <RatingGraph contestHistory={contestHistory} cfData={showCfGraph ? cfData : []} />
        )}
      </div>

      <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
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
