import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getHistory, getRatingPlot } from '@/api/contestSession'
import type { ContestHistoryItem, RatingPlot } from '@/api/types'
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
  const [ratingPlot, setRatingPlot] = useState<RatingPlot | null>(null)
  const [showCfGraph, setShowCfGraph] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [plotLoading, setPlotLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await getHistory(0, 50)
        if (!cancelled) setContestHistory(res.items)
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setPlotLoading(true)
    getRatingPlot(showCfGraph)
      .then((data) => {
        if (!cancelled) setRatingPlot(data)
      })
      .catch(() => {
        if (!cancelled) setRatingPlot({ themecp_ratings: [], codeforces_ratings: [] })
      })
      .finally(() => {
        if (!cancelled) setPlotLoading(false)
      })
    return () => { cancelled = true }
  }, [showCfGraph])

  if (!user) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
    </div>
  )

  const rating = user.rating ?? 0
  const maxRating = user.max_contest_rating ?? 0
  const bestPerf = user.best_performance ?? 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Left Column - User Details, Graph, and Pie Chart */}
      <div className="lg:col-span-2 space-y-6 sm:space-y-8">
        <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
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
            <span className="font-mono" style={{ color: getRatingColor(rating) }}>{user.rating ?? '—'}</span>
            <span className="text-sm text-gray-600">
              (max. {user.rating_label}, <span className="font-mono">{maxRating}</span>)
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm sm:text-base">
            <img src={star} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Best Performance:</span>
            <span className="font-mono" style={{ color: getRatingColor(bestPerf) }}>{bestPerf || '—'}</span>
          </p>
          <p className="flex items-center gap-2 text-sm sm:text-base">
            <img src={star} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Contest attempts:</span>
            <span className="font-mono">{user.contest_attempts}</span>
          </p>
          <p className="flex items-center gap-2 text-sm sm:text-base">
            <img src={mail} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
            Email: {user.email}
          </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={showCfGraph}
              onChange={(e) => setShowCfGraph(e.target.checked)}
              className="w-4 h-4 rounded border-gray-200 focus:ring-1 focus:ring-black focus:ring-offset-0"
            />
            <span>Plot CF rating graph</span>
          </label>
          {historyLoading || plotLoading ? (
            <p>Loading chart...</p>
          ) : (
            <RatingGraph
              themecpData={ratingPlot?.themecp_ratings ?? []}
              cfData={showCfGraph ? (ratingPlot?.codeforces_ratings ?? []) : []}
            />
          )}
        </div>

        <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
          {historyLoading ? (
            <p>Loading...</p>
          ) : (
            <ThemePieChart contestHistory={contestHistory} />
          )}
        </div>
      </div>

      {/* Right Column - Donation (Sticky) */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-6">
          <Donation />
        </div>
      </div>
    </div>
  )
}
