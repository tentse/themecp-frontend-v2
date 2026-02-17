import { useLevel } from '@/contexts/LevelContext'
import { getRatingColor } from '@/utils/rating'

export default function LevelsPage() {
  const { levels, loading } = useLevel()

  if (loading) {
    return <div className="p-8 text-center">Loading levels...</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-center">Level Sheet</h1>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 border-b-2 border-black pb-2 mb-2 font-bold">
          <div className="flex items-center justify-center">Level</div>
          <div className="flex items-center justify-center">Duration</div>
          <div className="flex items-center justify-center">Performance</div>
          <div className="flex items-center justify-center">P1</div>
          <div className="flex items-center justify-center">P2</div>
          <div className="flex items-center justify-center">P3</div>
          <div className="flex items-center justify-center">P4</div>
        </div>
        {levels.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-7 gap-2 py-2 border-b border-gray-200 items-center"
          >
            <div className="font-mono font-bold">{item.level}</div>
            <div
              className="rounded px-2 py-1 text-center text-sm"
              style={{ backgroundColor: getRatingColor(item.performance) }}
            >
              {item.duration_in_min} min
            </div>
            <div
              className="rounded px-2 py-1 text-center text-sm italic"
              style={{ backgroundColor: getRatingColor(item.performance) }}
            >
              {item.performance}
            </div>
            <div
              className="rounded px-2 py-1 text-center"
              style={{ backgroundColor: getRatingColor(item.p1_rating) }}
            >
              {item.p1_rating}
            </div>
            <div
              className="rounded px-2 py-1 text-center"
              style={{ backgroundColor: getRatingColor(item.p2_rating) }}
            >
              {item.p2_rating}
            </div>
            <div
              className="rounded px-2 py-1 text-center"
              style={{ backgroundColor: getRatingColor(item.p3_rating) }}
            >
              {item.p3_rating}
            </div>
            <div
              className="rounded px-2 py-1 text-center"
              style={{ backgroundColor: getRatingColor(item.p4_rating) }}
            >
              {item.p4_rating}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
