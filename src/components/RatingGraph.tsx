import { useEffect, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { ContestHistoryItem } from '@/api/types'

interface RatingGraphProps {
  contestHistory: ContestHistoryItem[]
  cfData?: { date: string; rating: number }[]
}

const Y_AXIS_REF = [0, 1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000, 4500]

export default function RatingGraph({ contestHistory, cfData = [] }: RatingGraphProps) {
  const [options, setOptions] = useState<Highcharts.Options>({
    chart: { type: 'line', height: 450 },
    title: { text: '' },
    credits: { enabled: false },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { day: '%e %b' },
      title: { text: 'Date' },
    },
    yAxis: {
      min: 0,
      title: { text: 'Rating' },
      tickPositions: Y_AXIS_REF,
      plotBands: [
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
      ],
    },
    series: [
      {
        name: 'ThemeCP Rating',
        type: 'line',
        color: '#000033',
        data: [],
        marker: { enabled: true, radius: 3 },
      },
      {
        name: 'CF Rating',
        type: 'line',
        color: 'red',
        data: [],
        marker: { enabled: true, radius: 3 },
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
    const themeCpData = Array.from(maxRatingByDate, ([date, value]) => [Date.parse(date), value] as [number, number])

    const cfMaxByDate = new Map<string, number>()
    cfData.forEach((item) => {
      if (item.date) {
        const current = cfMaxByDate.get(item.date)
        const newVal = Math.max(current ?? 0, item.rating)
        cfMaxByDate.set(item.date, newVal)
      }
    })
    const cfChartData = Array.from(cfMaxByDate, ([date, value]) => [Date.parse(date), value] as [number, number])

    setOptions((prev) => ({
      ...prev,
      series: [
        { ...prev.series?.[0], data: themeCpData },
        { ...prev.series?.[1], data: cfChartData },
      ],
    }))
  }, [contestHistory, cfData])

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
