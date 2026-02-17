import React, { useEffect, useState } from 'react'

const Timer_2hr = ({endContest}) => {

    const [timeLeft, setTimeLeft] = useState(0);
    
    useEffect(() => {
        let startTime = localStorage.getItem('timerStartTime');
        let endTime = localStorage.getItem('timerEndTime');
        if (!endTime) {
            const data = JSON.parse(localStorage.getItem('data'));
            startTime = new Date().getTime();
            endTime = new Date().getTime() + 1000 * 60 * Number(data.duration);
            localStorage.setItem('timerEndTime', endTime);
            localStorage.setItem('timerStartTime', startTime);
        }

        const updateTimer = () => {
            const currentTime = new Date().getTime();
            const remainingTime = endTime - currentTime;
            if (remainingTime <= 0) {
                endContest(true);
                setTimeLeft(0);
            } else {
                setTimeLeft(remainingTime);
            }
        };

        const intervalId = setInterval(updateTimer, 1000);

        updateTimer();

        return () => clearInterval(intervalId);
    }, []);

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <div>
            <p style={{fontSize:'25px', marginTop:'0px', marginLeft:'15px'}}>{timeLeft > 0 ? formatTime(timeLeft) : 'Time is up!'}</p>
        </div>
    )
}

export default Timer_2hr
