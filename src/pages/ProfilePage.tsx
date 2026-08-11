import { useEffect, useState } from 'react'
import { getHistory, getRatingPlot } from '@/api/contestSession'
import type { ContestHistoryItem, RatingPlot } from '@/api/types'
import { useProfileView } from '@/hooks/useProfileView'
import AddHandle from '@/components/AddHandle'
import RatingGraph from '@/components/RatingGraph'
import ContestHeatMap from '@/components/ContestHeatMap'
import ThemePieChart from '@/components/PieChart'
import ratingPic from '@/assets/rating.png'
import star from '@/assets/star.png'
import mail from '@/assets/mail.png'
import { getRatingColor, getRatingLabelColor } from '@/utils/rating'

export default function ProfilePage() {
  const { profileUser, viewedUserId, isOwnProfile } = useProfileView()
  const [contestHistory, setContestHistory] = useState<ContestHistoryItem[]>([])
  const [ratingPlot, setRatingPlot] = useState<RatingPlot | null>(null)
  const [showCfGraph, setShowCfGraph] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [plotLoading, setPlotLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setHistoryLoading(true)
    const load = async () => {
      try {
        const res = await getHistory(0, 50, viewedUserId)
        if (!cancelled) setContestHistory(res.items)
      } catch {
        if (!cancelled) setContestHistory([])
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [viewedUserId])

  useEffect(() => {
    let cancelled = false
    setPlotLoading(true)
    getRatingPlot(showCfGraph, viewedUserId)
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
  }, [showCfGraph, viewedUserId])

  if (!profileUser) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
    </div>
  )

  const rating = profileUser.rating ?? 0
  const maxRating = profileUser.max_contest_rating ?? 0
  const bestPerf = profileUser.best_performance ?? 0

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="p-4 sm:p-6 md:p-8 rounded-[10px] border-2 border-gray-500 bg-white">
        <div className="space-y-3 sm:space-y-4">
          <p style={{ color: getRatingLabelColor(profileUser.rating_label) }} className="text-xl">
            {profileUser.rating_label}
          </p>
          {profileUser.codeforces_handle ? (
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: getRatingLabelColor(profileUser.rating_label) }}>
              {profileUser.codeforces_handle}
            </p>
          ) : (
            // Roughly 2,500 of 11,140 users have no handle. Only the owner can add one.
            isOwnProfile ? <AddHandle /> : <p className="text-gray-600">No Codeforces handle linked</p>
          )}
          <p className="flex items-center gap-2 text-sm sm:text-base">
            <img src={ratingPic} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
            Contest Rating:{' '}
            <span className="font-mono" style={{ color: getRatingColor(rating) }}>{profileUser.rating ?? '—'}</span>
            <span className="text-sm text-gray-600">
              (max. {profileUser.rating_label}, <span className="font-mono">{maxRating}</span>)
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
            <span className="font-mono">{profileUser.contest_attempts}</span>
          </p>
          {/* The server returns email only to the owner, so its presence IS the
              permission check — never decide this from the client's own state. */}
          {profileUser.email && (
            <p className="flex items-center gap-2 text-sm sm:text-base">
              <img src={mail} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
              Email: {profileUser.email}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 rounded-[10px] border-2 border-gray-500 bg-white">
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={showCfGraph}
            onChange={(e) => setShowCfGraph(e.target.checked)}
            className="w-4 h-4 rounded-[3px] border-2 border-black accent-black focus:ring-1 focus:ring-black focus:ring-offset-0"
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

      <div className="p-4 sm:p-6 md:p-8 rounded-[10px] border-2 border-gray-500 bg-white">
        <ContestHeatMap userId={viewedUserId} />
      </div>

      <div className="p-4 sm:p-6 md:p-8 rounded-[10px] border-2 border-gray-500 bg-white">
        {historyLoading ? (
          <p>Loading...</p>
        ) : (
          <ThemePieChart contestHistory={contestHistory} />
        )}
      </div>
    </div>
  )
}
