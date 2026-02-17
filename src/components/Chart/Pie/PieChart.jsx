import React, { useEffect, useState } from 'react'
import Highcharts, { chart } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const PieChart = ({chart_data}) => {

    const [options, setOptions] = useState({
        chart: {
            height: 460,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Count',
            colorByPoint: true,
            data: []
        }],
        legend: {
            align: 'left',          // Align the legend to the left
            verticalAlign: 'middle', // Vertically align the legend in the middle
            layout: 'vertical',      // Layout the legend vertically
            x: 30,                  // Horizontal offset from the chart's right side
            y: -20                     // Vertical offset
        }
    });

    useEffect(() => {
        if (chart_data.length === 0) {
            return;
        }
        const formatData = [];
        for (let item of chart_data) {
            formatData.push({
                name: item[0],
                y: item[1],
            });
        }
        setOptions(pre => ({
            ...pre,
            series: [{...pre.series[0], data: formatData}],
        }))
    }, [chart_data])

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options}/>
    </div>
  )
}

export default PieChart
