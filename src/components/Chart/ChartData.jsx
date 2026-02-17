import React, { useEffect, useState } from 'react'
import Chart from './Chart'

const ChartData = ({user_contest, cf_contest}) => {

    const reference = [0, 1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000, 4500];

    const [chartData, setChartData] = useState([]);
    const [cf_chartData, setCFchartdata] = useState([]);
    const maxRatingByDate = new Map();
    useEffect(() => {
        user_contest.forEach(data => {
            if (data.date) {
                if (maxRatingByDate.has(data.date)) {
                    maxRatingByDate.set(data.date, Math.max(maxRatingByDate.get(data.date), data.rating));
                } else {
                    maxRatingByDate.set(data.date, data.rating);
                }
            }
        });
        const format = Array.from(maxRatingByDate, ([date,value]) => ({date, value}));
        setChartData(() => format);
    },[user_contest]);
    
    const cfMaxRatingByDate = new Map();
    useEffect(() => {
        if (cf_contest.length === 0) {
            setCFchartdata(() => []);
            return;
        }
        cf_contest.forEach(data => {
            if (data.date) {
                if (cfMaxRatingByDate.has(data.date)) {
                    cfMaxRatingByDate.set(data.date, Math.max(cfMaxRatingByDate.get(data.date), data.rating));
                } else {
                    cfMaxRatingByDate.set(data.date, data.rating);
                }
            }
        });
        const format = Array.from(cfMaxRatingByDate, ([date,value]) => ({date, value}));
        setCFchartdata(() => format);
    }, [cf_contest])

    let maxRating = Math.max(1900, Math.max(...chartData.map(data => data.value)));
    maxRating = Math.max(maxRating, Math.max(...cf_chartData.map(data => data.value)));
    let minRating = Math.min(1000, Math.min(...chartData.map(data => data.value)));
    minRating = Math.min(minRating, Math.min(...cf_chartData.map(data => data.value)));
    minRating = Math.max(0, minRating - 200);
    const yAxisValue = [minRating];
    for (let i of reference) {
        if (i > minRating)
            yAxisValue.push(i);
        if (i > maxRating) {
            break;
        }
    }

    return (
        <div>
            <Chart chartData={chartData} cf_Data={cf_chartData} yAxisValue={yAxisValue} />
        </div>
    )
}

export default ChartData
