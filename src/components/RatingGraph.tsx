import { useEffect, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { ContestHistoryItem } from '@/api/types'

interface RatingGraphProps {
  contestHistory: ContestHistoryItem[]
  cfData?: { date: string; rating: number }[]
}

const Y_AXIS_REF = [0, 1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000, 4500]
const COMPRESS_THRESHOLD = 1200
const COMPRESS_FACTOR = 0.70

function toDisplayRating(rating: number): number {
  if (rating <= COMPRESS_THRESHOLD) return rating * COMPRESS_FACTOR
  return COMPRESS_THRESHOLD * COMPRESS_FACTOR + (rating - COMPRESS_THRESHOLD)
}

function toActualRating(displayRating: number): number {
  const compressedTop = COMPRESS_THRESHOLD * COMPRESS_FACTOR
  if (displayRating <= compressedTop) return displayRating / COMPRESS_FACTOR
  return COMPRESS_THRESHOLD + (displayRating - compressedTop)
}

export default function RatingGraph({ contestHistory, cfData = [] }: RatingGraphProps) {
  const [options, setOptions] = useState<Highcharts.Options>({
    chart: { 
      type: 'line', 
      height: 380,
      zoomType: 'x',
      backgroundColor: '#ffffff',
      resetZoomButton: {
        theme: {
          fill: '#000033',
          stroke: '#000033',
          style: { color: '#ffffff' }
        }
      }
    },
    title: { text: '' },
    credits: { enabled: false },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { 
        day: '%e %b',
        week: '%e %b',
        month: '%b \'%y'
      },
      title: { text: 'Date' },
      gridLineWidth: 1,
      gridLineColor: '#e0e0e0',
      crosshair: {
        width: 1,
        color: '#cccccc',
        dashStyle: 'Dash'
      }
    },
    yAxis: {
      min: 0,
      title: { text: 'Rating' },
      tickPositions: Y_AXIS_REF.map(toDisplayRating),
      plotBands: [],
      labels: {
        formatter: function() {
          return Math.round(toActualRating(Number(this.value))).toString()
        }
      },
      gridLineWidth: 1,
      gridLineColor: '#e0e0e0',
      crosshair: {
        width: 1,
        color: '#cccccc',
        dashStyle: 'Dash'
      }
    },
    plotOptions: {
      line: {
        lineWidth: 2
      }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderRadius: 8,
      padding: 12,
      formatter: function() {
        const date = new Date(this.x as number)
        const formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
        
        let tooltip = `<div style="font-size: 12px;"><b>${formattedDate}</b><br/>`
        
        this.points?.forEach((point) => {
          const color = point.series.color as string
          const prevPoint = point.series.data[point.point.index - 1]
          const currentValue = Math.round(toActualRating(point.y as number))
          const prevValue = prevPoint
            ? Math.round(toActualRating(prevPoint.y as number))
            : currentValue
          const change = currentValue - prevValue
          const arrow = change > 0 ? '↑' : change < 0 ? '↓' : ''
          const changeColor = change > 0 ? '#00aa00' : change < 0 ? '#ff0000' : '#888888'
          
          tooltip += `<div style="margin-top: 6px;">
            <span style="color: ${color};">●</span> ${point.series.name}: <b>${currentValue}</b>
            ${change !== 0 ? `<span style="color: ${changeColor};"> ${arrow}${Math.abs(change)}</span>` : ''}
          </div>`
        })
        
        tooltip += '</div>'
        return tooltip
      }
    },
    series: [
      {
        name: 'ThemeCP Rating',
        type: 'line',
        color: '#000033',
        data: [],
        marker: { 
          enabled: true, 
          radius: 4,
          symbol: 'circle',
          states: {
            hover: {
              enabled: true,
              radius: 6
            }
          }
        },
      },
      {
        name: 'CF Rating',
        type: 'line',
        color: '#ff0000',
        data: [],
        marker: { 
          enabled: true, 
          radius: 4,
          symbol: 'circle',
          states: {
            hover: {
              enabled: true,
              radius: 6
            }
          }
        },
      },
    ],
  })

  useEffect(() => {
    const maxRatingByDate = new Map<string, number>()
    contestHistory.forEach((item) => {
      if (item.date) {
        const current = maxRatingByDate.get(item.date)
        const newVal = Math.max(current ?? 0, item.rating_after)
        maxRatingByDate.set(item.date, newVal)
      }
    })
    const themeCpData = Array.from(
      maxRatingByDate,
      ([date, value]) => [Date.parse(date), toDisplayRating(value)] as [number, number]
    )

    const cfMaxByDate = new Map<string, number>()
    cfData.forEach((item) => {
      if (item.date) {
        const current = cfMaxByDate.get(item.date)
        const newVal = Math.max(current ?? 0, item.rating)
        cfMaxByDate.set(item.date, newVal)
      }
    })
    const cfChartData = Array.from(
      cfMaxByDate,
      ([date, value]) => [Date.parse(date), toDisplayRating(value)] as [number, number]
    )

    // Calculate maximum rating from both data sources
    const themeCpMaxRating = contestHistory.length > 0 
      ? Math.max(...contestHistory.map(item => item.rating_after))
      : 0
    const cfMaxRating = cfData.length > 0
      ? Math.max(...cfData.map(item => item.rating))
      : 0
    const maxRating = Math.max(themeCpMaxRating, cfMaxRating, 2000)

    // Generate dynamic tick positions
    const dynamicTicks = Y_AXIS_REF.filter(tick => tick <= maxRating)
    // Add maxRating if it's not already in the ticks
    if (!dynamicTicks.includes(maxRating)) {
      dynamicTicks.push(maxRating)
      dynamicTicks.sort((a, b) => a - b)
    }
    const displayTicks = dynamicTicks.map(toDisplayRating)

    // Filter plot bands to only show relevant ranges
    const plotBandsData = [
      { color: '#CCCCCC', from: 0, to: 1200 },
      { color: '#77FF77', from: 1200, to: 1400 },
      { color: '#77DDBB', from: 1400, to: 1600 },
      { color: '#AAAAFF', from: 1600, to: 1900 },
      { color: '#FF88FF', from: 1900, to: 2100 },
      { color: '#FFCC88', from: 2100, to: 2300 },
      { color: '#FFBB55', from: 2300, to: 2400 },
      { color: '#FF7777', from: 2400, to: 2600 },
      { color: '#FF3333', from: 2600, to: 3000 },
      { color: '#AA0000', from: 3000, to: 4500 },
    ]
    const filteredPlotBands = plotBandsData
      .filter(band => band.from < maxRating)
      .map(band => ({
        color: band.color,
        from: toDisplayRating(band.from),
        to: toDisplayRating(Math.min(band.to, maxRating))
      }))

    setOptions((prev) => ({
      ...prev,
      yAxis: {
        min: 0,
        title: { text: 'Rating' },
        max: toDisplayRating(maxRating),
        tickPositions: displayTicks,
        plotBands: filteredPlotBands,
        labels: {
          formatter: function() {
            return Math.round(toActualRating(Number(this.value))).toString()
          }
        },
        gridLineWidth: 1,
        gridLineColor: '#e0e0e0',
        crosshair: {
          width: 1,
          color: '#cccccc',
          dashStyle: 'Dash'
        }
      },
      series: [
        {
          name: 'ThemeCP Rating',
          type: 'line',
          color: '#000033',
          data: themeCpData,
          marker: { 
            enabled: true, 
            radius: 4,
            symbol: 'circle',
            states: {
              hover: {
                enabled: true,
                radius: 6
              }
            }
          },
        },
        {
          name: 'CF Rating',
          type: 'line',
          color: '#ff0000',
          data: cfChartData,
          marker: { 
            enabled: true, 
            radius: 4,
            symbol: 'circle',
            states: {
              hover: {
                enabled: true,
                radius: 6
              }
            }
          },
        },
      ],
    }))
  }, [contestHistory, cfData])

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
