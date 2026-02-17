import { useEffect, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { ContestHistoryItem } from '@/api/types'

interface PieChartProps {
  contestHistory: ContestHistoryItem[]
}

export default function ThemePieChart({ contestHistory }: PieChartProps) {
  const [options, setOptions] = useState<Highcharts.Options>({
    chart: { type: 'pie', height: 460 },
    title: { text: '' },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: { enabled: false },
        showInLegend: true,
      },
    },
    series: [{ name: 'Count', type: 'pie', colorByPoint: true, data: [] }],
    legend: { align: 'left', verticalAlign: 'middle', layout: 'vertical' },
  })

  useEffect(() => {
    const themeCount = new Map<string, number>()
    contestHistory.forEach((item) => {
      const theme = item.theme || 'unknown'
      themeCount.set(theme, (themeCount.get(theme) ?? 0) + 1)
    })
    const formatData = Array.from(themeCount, ([name, y]) => ({ name, y }))

    setOptions((prev) => ({
      ...prev,
      series: [{ ...prev.series?.[0], data: formatData }],
    }))
  }, [contestHistory])

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
