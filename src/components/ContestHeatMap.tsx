import { useEffect, useState, useMemo } from 'react'
import { getHeatgraphData } from '@/api/contestSession'
import type { HeatgraphData } from '@/api/types'

const HEAT_COLORS = [
  '#ebedf0', // 0 - none
  '#9be9a8', // 1
  '#40c463', // 2
  '#30a14e', // 3
  '#216e39', // 4+
]

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getColorLevel(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

function getDaysInYear(year: number): number {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365
}

function getMonthStartWeekIndices(year: number, firstDay: number): number[] {
  const result: number[] = []
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) daysInMonth[1] = 29
  let dayOfYear = 0
  for (let m = 0; m < 12; m++) {
    dayOfYear += m === 0 ? 0 : daysInMonth[m - 1]
    const weekIndex = Math.floor((firstDay + dayOfYear - 1) / 7)
    result.push(weekIndex)
  }
  return result
}

interface DayCell {
  date: string
  count: number
}

export default function ContestHeatMap() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [data, setData] = useState<HeatgraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getHeatgraphData(year)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load activity data')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [year])

  const [tooltip, setTooltip] = useState<{ date: string; count: number } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const { grid, weekCount, monthStartWeeks } = useMemo(() => {
    const items = data?.items ?? []
    const map = new Map<string, number>()
    for (const { date, contest_attempts } of items) {
      map.set(date, contest_attempts)
    }

    const daysInYear = getDaysInYear(year)
    const firstDay = new Date(Date.UTC(year, 0, 1)).getUTCDay() // 0 = Sun
    const grid: (DayCell | null)[][] = Array.from({ length: 7 }, () => [])
    let maxWeek = 0

    for (let dayOfYear = 1; dayOfYear <= daysInYear; dayOfYear++) {
      const d = new Date(Date.UTC(year, 0, dayOfYear))
      const dateStr = d.toISOString().slice(0, 10)
      const count = map.get(dateStr) ?? 0
      const dayOfWeek = (firstDay + dayOfYear - 1) % 7
      const weekIndex = Math.floor((firstDay + dayOfYear - 1) / 7)
      maxWeek = Math.max(maxWeek, weekIndex)
      while (grid[dayOfWeek].length <= weekIndex) {
        grid[dayOfWeek].push(null)
      }
      grid[dayOfWeek][weekIndex] = { date: dateStr, count }
    }

    // Fill trailing nulls so each row has same length
    const weekCount = maxWeek + 1
    for (let row = 0; row < 7; row++) {
      while (grid[row].length < weekCount) {
        grid[row].push(null)
      }
    }

    const monthStartWeeks = getMonthStartWeekIndices(year, firstDay)
    return { grid, weekCount, monthStartWeeks }
  }, [data, year])

  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = currentYear; y >= 2000; y--) arr.push(y)
    return arr
  }, [currentYear])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[120px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold">Contest activity</h3>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-black focus:ring-offset-0"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Tooltip position and dismiss tracked on wrapper; cells are native buttons */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- tooltip positioning only */}
      <div
        className="overflow-x-auto relative"
        onMouseMove={(e) => tooltip && setTooltipPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Month labels row */}
        <div
          className="inline-grid gap-[3px] mb-1"
          style={{
            gridTemplateColumns: `repeat(${weekCount}, 12px)`,
            width: weekCount * 12 + (weekCount - 1) * 3,
          }}
        >
          {Array.from({ length: weekCount }, (_, colIndex) => {
            const monthIndex = monthStartWeeks.indexOf(colIndex)
            return (
              <div
                key={colIndex}
                className="text-[10px] text-gray-500 font-medium leading-none"
                style={{ minWidth: 12 }}
              >
                {monthIndex >= 0 ? MONTH_LABELS[monthIndex] : ''}
              </div>
            )
          })}
        </div>

        {/* Heat grid */}
        <div
          className="inline-grid gap-[3px]"
          style={{
            gridTemplateRows: 'repeat(7, 12px)',
            gridAutoFlow: 'column',
            gridAutoColumns: '12px',
          }}
        >
          {Array.from({ length: weekCount }, (_, colIndex) =>
            grid.map((row, rowIndex) => {
              const cell = row[colIndex] ?? null
              if (!cell) {
                return (
                  <div
                    key={`e-${rowIndex}-${colIndex}`}
                    className="rounded-sm"
                    style={{ width: 12, height: 12, backgroundColor: HEAT_COLORS[0] }}
                  />
                )
              }
              const level = getColorLevel(cell.count)
              const color = HEAT_COLORS[level]
              const titleText = `Date: ${cell.date}, Contest attempts: ${cell.count}`
              return (
                <button
                  key={cell.date}
                  type="button"
                  title={titleText}
                  className="rounded-sm transition-opacity hover:opacity-80 cursor-pointer relative border-0 p-0 block"
                  style={{
                    backgroundColor: color,
                    width: 12,
                    height: 12,
                  }}
                  onMouseEnter={(e) => {
                    setTooltip({ date: cell.date, count: cell.count })
                    setTooltipPos({ x: e.clientX, y: e.clientY })
                  }}
                  onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            })
          ).flat()}
        </div>

        {/* Hover tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 px-2 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: 'translate(-50%, -100%)',
              marginTop: -8,
            }}
          >
            <div>Date: {tooltip.date}</div>
            <div>Contest attempts: {tooltip.count}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
        <span>Less</span>
        {HEAT_COLORS.map((color) => (
          <div
            key={color}
            className="rounded-sm"
            style={{ width: 12, height: 12, backgroundColor: color }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
