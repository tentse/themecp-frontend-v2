import { useLevel } from '@/contexts/LevelContext'
import { getRatingColor } from '@/utils/rating'

export default function LevelsPage() {
  const { levels, loading } = useLevel()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center">Level Sheet</h1>
      <div className="p-4 sm:p-6 md:p-8 nb-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 font-bold min-w-[820px] text-sm sm:text-base">
            <div className="flex items-center justify-center border border-black p-3 sm:p-4">Level</div>
            <div className="flex items-center justify-center border border-black p-3 sm:p-4">Duration</div>
            <div className="flex items-center justify-center border border-black p-3 sm:p-4">Performance</div>
            <div className="flex items-center justify-center border border-black p-3 sm:p-4">P1</div>
            <div className="flex items-center justify-center border border-black p-3 sm:p-4">P2</div>
            <div className="flex items-center justify-center border border-black p-3 sm:p-4">P3</div>
            <div className="flex items-center justify-center border border-black p-3 sm:p-4">P4</div>
          </div>
          {levels.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-7 items-center min-w-[820px] text-sm sm:text-base"
            >
              <div className="flex items-center justify-center border border-black bg-gray-100 px-4 py-3 sm:px-6 sm:py-4 min-h-12 sm:min-h-16 font-mono font-bold">
                {item.level}
              </div>
              <div
                className="flex items-center justify-center border border-black px-4 py-3 sm:px-6 sm:py-4 min-h-12 sm:min-h-16 text-center font-medium"
                style={{ backgroundColor: getRatingColor(item.performance) }}
              >
                {item.duration_in_min} min
              </div>
              <div
                className="flex items-center justify-center border border-black px-4 py-3 sm:px-6 sm:py-4 min-h-12 sm:min-h-16 text-center font-medium italic"
                style={{ backgroundColor: getRatingColor(item.performance) }}
              >
                {item.performance}
              </div>
              <div
                className="flex items-center justify-center border border-black px-4 py-3 sm:px-6 sm:py-4 min-h-12 sm:min-h-16 text-center font-medium"
                style={{ backgroundColor: getRatingColor(item.p1_rating) }}
              >
                {item.p1_rating}
              </div>
              <div
                className="flex items-center justify-center border border-black px-4 py-3 sm:px-6 sm:py-4 min-h-12 sm:min-h-16 text-center font-medium"
                style={{ backgroundColor: getRatingColor(item.p2_rating) }}
              >
                {item.p2_rating}
              </div>
              <div
                className="flex items-center justify-center border border-black px-4 py-3 sm:px-6 sm:py-4 min-h-12 sm:min-h-16 text-center font-medium"
                style={{ backgroundColor: getRatingColor(item.p3_rating) }}
              >
                {item.p3_rating}
              </div>
              <div
                className="flex items-center justify-center border border-black px-4 py-3 sm:px-6 sm:py-4 min-h-12 sm:min-h-16 text-center font-medium"
                style={{ backgroundColor: getRatingColor(item.p4_rating) }}
              >
                {item.p4_rating}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
