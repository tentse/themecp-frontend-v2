import React, { useEffect, useState } from 'react'
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const Chart = ({chartData, cf_Data, yAxisValue}) => {


    const [options, setOptions] = useState({
        chart: {
            type: 'line',
            height: 450,
            zoomType: 'xy',
            resetZoomButton: {
                position: {
                    align: 'right',
                    verticalAlign: 'bottom',
                    x: -10,
                    y: -45
                },
            }
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false // Disable the watermark
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {day: '%e %b'},
            gridLineWidth: 1,
            title: {text: 'Date'},
            tickInterval: 1000 * 60 * 60 * 24 * 2,
        },
        yAxis: {
            min: 0,
            title: {text: 'Rating'},
            tickPositions: [],
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
                name: 'ThemeCP_Rating',
                color: '#000033',
                data: [],
                marker: {
                    enabled: true,
                    symbol: 'black',
                    radius: 3,
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: 'black',
                }
            },
            {
                name: 'CF_Rating',
                color: 'red',
                data: [],
                marker: {
                    enabled: true,
                    symbol: 'black',
                    radius: 3,
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: 'black',
                }
            },
        ],
        rangeSelector: {
            enabled: true,  // Enables a range selector for easy zooming
        }
    });

    useEffect(() => {
        const formattedData = chartData.map(entry => [
            Date.parse(entry.date),
            entry.value,
        ]);

        setOptions(prevOptions => ({
            ...prevOptions,
            yAxis:{...prevOptions.yAxis, tickPositions: yAxisValue},
            series: [{ ...prevOptions.series[0], data: formattedData },{...prevOptions.series[1], data: []}],
        }));
    }, [chartData, yAxisValue]);

    useEffect(() => {
        if (cf_Data.length === 0) {
            return;
        }
        const formattedData = cf_Data.map(entry => [
            Date.parse(entry.date),
            entry.value,
        ]);
        setOptions(prevOptions => ({
            ...prevOptions,
            yAxis:{...prevOptions.yAxis, tickPositions: yAxisValue},
            series: [{...prevOptions.series[0], data: prevOptions.series[0].data}, {...prevOptions.series[1], data: formattedData}],
        }))
    }, [cf_Data])

    return <HighchartsReact highcharts={Highcharts} options={options}/>
}

export default Chart
