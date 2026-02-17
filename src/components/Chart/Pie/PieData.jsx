import React, { useEffect, useState } from 'react'
import PieChart from './PieChart';

const PieData = ({user_contest}) => {

    const [contest_topic, setContestTopic] = useState([]);

    useEffect(() => {
        if (user_contest.length > 0) {
            const map = new Map();
            for (let item of user_contest) {
                if (map.has(item.topic)) {
                    map.set(item.topic, map.get(item.topic) + 1);
                } else {
                    map.set(item.topic, 1);
                }
            }
            setContestTopic(map);
        }
    },[user_contest])

  return (
    <div>
        <PieChart chart_data={contest_topic} />
    </div>
  )
}

export default PieData
