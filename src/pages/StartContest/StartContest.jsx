import React, { useEffect, useState } from 'react'
import './StartContest.css'
import Timer_2hr from '../../components/Timer/Timer_2hr'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie';

const StartContest = () => {

  const navigate = useNavigate();

  let solved_data = JSON.parse(localStorage.getItem('solve_data')) || [true,false,false,false,false];
  const [solved, setSolved] = useState(solved_data);
  const [endContest, setEndContest] = useState(false);

  let data = JSON.parse(localStorage.getItem('data'));

  useEffect(() => {
    const twoMinute = localStorage.getItem('2min-endTime');
    if (twoMinute) {
      const time = new Date().getTime();
      if (twoMinute - time > 0) {
        navigate('/contest');
      }
    } else {
      navigate('/contest');
    }
    const get_username = async () => {
      const check = await fetch('https://themecp.up.railway.app/api/profile', {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`,
        },
      }) .then((res) => res.json());
      if (data.user_email !== check.email) {
        alert('Login back to the email in which you have started the contest');
        navigate('/');
      } else {
        data.handle = check.codeforces_handle;
        localStorage.setItem('data', JSON.stringify(data));
      }
    };
    get_username();
  }, []);

  useEffect(() => {
    if (solved[4]) {
      setEndContest(true);
    }
    localStorage.setItem('solve_data', JSON.stringify(solved));
    // //console.log(JSON.parse(localStorage.getItem('solve_data')));
  }, [solved]);

  useEffect(() => {
    if (endContest) {
      //console.log(data);
      handleClick();
      const final_data = JSON.parse(localStorage.getItem('data'));
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formatDate = `${year}-${month}-${day}`;
      final_data.date = formatDate;
      
      const add_data = async () => {
        //console.log(final_data);
        const api_call = await fetch('https://themecp.up.railway.app/api/addContestData', {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token')}`,
          },
          body: JSON.stringify(final_data),
        }).then(res => {
          if (res.ok) {
            localStorage.removeItem('2min-startTime');
            localStorage.removeItem('2min-endTime');
            localStorage.removeItem('timerStartTime');
            localStorage.removeItem('timerEndTime');
            localStorage.removeItem('solve_data');
            localStorage.removeItem('data');
            alert('Contest is over!');
            navigate('/contest');
          } else {
            alert('Fail to add data, Please try again later');
          }
        });
        // if (api_call.ok) {
        //   //console.log('done');
        // } else {
        //   //console.log('something went wrong');
        // }
      }
      add_data();
      // .then(() => {
      //   alert('Contest is Over');
      //   localStorage.removeItem('2min-startTime');
      //   localStorage.removeItem('2min-endTime');
      //   localStorage.removeItem('timerStartTime');
      //   localStorage.removeItem('timerEndTime');
      //   localStorage.removeItem('solve_data');
      //   localStorage.removeItem('data');
      //   navigate('/contest');
      // });
    }
  }, [endContest])

  async function handleClick() {
    let nowTime = new Date().getTime();
    let minTimeWait = localStorage.getItem('minTimeWait');
    if (minTimeWait) {
      if (minTimeWait - nowTime > 0) {
        const totalSeconds = Math.floor((minTimeWait - nowTime) / 1000);
        const second = totalSeconds % 60;
        alert(`Kindly try after ${second} seconds`);
        return;
      } else {
        minTimeWait = nowTime + 1000 * 6;
        localStorage.setItem('minTimeWait', minTimeWait);
      }
    } else {
      const waitTime = nowTime + 1000 * 6;
      localStorage.setItem('minTimeWait', waitTime);
    }
    const to_search = {};
    if (!solved[1]) {
      to_search.position = 1;
      to_search.id1 = data.id1;
      to_search.index1 = data.index1;
    } if (!solved[2]) {
      to_search.position = 2;
      to_search.id2 = data.id2;
      to_search.index2 = data.index2;
    } if (!solved[3]) {
      to_search.position = 3;
      to_search.id3 = data.id3;
      to_search.index3 = data.index3;
    } if (!solved[4]) {
      to_search.position = 4;
      to_search.id4 = data.id4;
      to_search.index4 = data.index4;
    } else {
      return;
    }
    const user_submission = await fetch(`https://codeforces.com/api/user.status?handle=${data.handle}&from=1&count=10`)
      .then((res) => res.json());
    
    function formatTime(milliseconds) {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minute = Math.floor((totalSeconds % 3600) / 60);
      const solvedAt = minute + (hours * 60);
      return solvedAt;
    }

    const newSolved = [...solved];
    data = JSON.parse(localStorage.getItem('data'));
    
    user_submission.result.reverse();
    
    for (let item of user_submission.result) {
      if (!newSolved[1] && item.problem.contestId === to_search.id1 && item.problem.index === to_search.index1 && item.verdict === 'OK') {
          const startTime = localStorage.getItem('timerStartTime');
          nowTime = (Number(item.creationTimeSeconds) * 1000);
          const milliseconds = nowTime - startTime;
          const solvedAt = formatTime(milliseconds);
          data.T1 = solvedAt;
          newSolved[1] = true;
      }
      if (newSolved[1] && !newSolved[2] && item.problem.contestId === to_search.id2 && item.problem.index === to_search.index2 && item.verdict === 'OK') {
        const startTime = localStorage.getItem('timerStartTime');
        nowTime = (Number(item.creationTimeSeconds) * 1000);
        const milliseconds = nowTime - startTime;
        const solvedAt = formatTime(milliseconds);
        if (Number(solvedAt) >= Number(data.T1)) {
          data.T2 = solvedAt;
          newSolved[2] = true;
        }
      }
      if (newSolved[1] && newSolved[2] && !newSolved[3] && item.problem.contestId === to_search.id3 && item.problem.index === to_search.index3 && item.verdict === 'OK') {
        const startTime = localStorage.getItem('timerStartTime');
        nowTime = (Number(item.creationTimeSeconds) * 1000);
        const milliseconds = nowTime - startTime;
        const solvedAt = formatTime(milliseconds);
        if (Number(solvedAt) >= Number(data.T2) && Number(solvedAt) >= Number(data.T1)) {
          data.T3 = solvedAt;
          newSolved[3] = true;
        }
      }
      if (newSolved[1] && newSolved[2] && newSolved[3] && !newSolved[4] && item.problem.contestId === to_search.id4 && item.problem.index === to_search.index4 && item.verdict === 'OK') {
        const startTime = localStorage.getItem('timerStartTime');
        nowTime = (Number(item.creationTimeSeconds) * 1000);
        const milliseconds = nowTime - startTime;
        const solvedAt = formatTime(milliseconds);
        if (Number(solvedAt) >= Number(data.T3) && Number(solvedAt) >= Number(data.T2) && Number(solvedAt) >= Number(data.T1)) {
          data.T4 = solvedAt;
          newSolved[4] = true;
        }
      }
    }
    setSolved(newSolved);
    localStorage.setItem('data', JSON.stringify(data));
    if (newSolved[4]) {
      setEndContest(() => true);
    }
    
  }

  const getBackgroundColor = (data) => {
      const rating = parseInt(data);
      if (rating >= 0 && rating < 1200) {
          return '#CCCCCC';
      } else if (rating >= 1200 && rating < 1400) {
          return '#77FF77';
      } else if (rating >= 1400 && rating < 1600) {
          return '#77DDBB';
      } else if (rating >= 1600 && rating < 1900) {
          return '#AAAAFF';
      } else if (rating >= 1900 && rating < 2100) {
          return '#FF88FF';
      } else if (rating >= 2100 && rating < 2300) {
          return '#FFCC88';
      } else if (rating >= 2300 && rating < 2400) {
          return '#FFBB55';
      } else if (rating >= 2400 && rating < 2600) {
          return '#FF7777';
      } else if (rating >= 2600 && rating < 3000) {
          return '#FF3333';
      } else if (rating >= 3000) {
          return '#AA0000';
      }
  }

  return (
    <div style={{border:'2px solid black', height:'540px', borderRadius:'20px', marginTop:'20px'}}>
      <div style={{color:'Red', marginLeft:'20px', marginTop:'10px', fontSize:'larger'}}>
        NOTE: 
      </div>
      <div className='important-note'>
        1. <span style={{color:'Red'}}>You have to solve problem in orderwise, otherwise your problem solved may not get update here.</span> <br />
        2. ThemeCP doesn't checks submission automatically. You will have to hit the refresh button to update the status. <br />
        3. You can solve all the problem in order first and then hit refresh to update the status. <br />
        4. Do note that ThemeCP only checks the last 10 submission by user on codeforces.
      </div>
      <div className='contest-outer-container'>
        <div className='contest-main-container'>
            <div style={{display:'flex', gap:'20px'}}>
                <p style={{marginLeft: '5px'}}>Problems : </p>
                <div style={{display:'flex'}}><button onClick={handleClick} style={{height:'40px', marginTop:'12px'}} className='refresh-button'>Refresh</button></div>
            </div>
            <div className='contest-problem-table'>
              <table>
                <thead>
                  <tr>
                    <th style={{width:'50px'}}>#</th>
                    <th>Name</th>
                    <th style={{width:'120px'}}>Rating</th>
                    <th style={{width:'150px'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td style={{backgroundColor: (true ? 'white' : 'lightgrey'), opacity: (true ? '1' : '0.5')}}><a style={{pointerEvents: (true ? 'auto': 'none')}} href={`https://codeforces.com/problemset/problem/${data.id1}/${data.index1}`} target='_blank'>Problem A</a></td>
                    <td style={{backgroundColor: getBackgroundColor(Number(data.R1))}}>{data.R1}</td>
                    <td style={{backgroundColor: (solved[1] ? '#D4EDC9' : '#FFE3E3')}}>{solved[1] ? 'Accepted' : 'Pending'}</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td style={{backgroundColor: (true ? 'white' : 'lightgrey'), opacity: (true ? '1' : '0.5')}}><a style={{pointerEvents: (true ? 'auto': 'none')}} href={`https://codeforces.com/problemset/problem/${data.id2}/${data.index2}`} target='_blank'>Problem B</a></td>
                    <td style={{backgroundColor: getBackgroundColor(Number(data.R2))}}>{data.R2}</td>
                    <td style={{backgroundColor: (solved[2] ? '#D4EDC9' : '#FFE3E3')}}>{solved[2] ? 'Accepted' : 'Pending'}</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td style={{backgroundColor: (true ? 'white' : 'lightgrey'), opacity: (true ? '1' : '0.5')}}><a style={{pointerEvents: (true ? 'auto': 'none')}} href={`https://codeforces.com/problemset/problem/${data.id3}/${data.index3}`} target='_blank'>Problem C</a></td>
                    <td style={{backgroundColor: getBackgroundColor(Number(data.R3))}}>{data.R3}</td>
                    <td style={{backgroundColor: (solved[3] ? '#D4EDC9' : '#FFE3E3')}}>{solved[3] ? 'Accepted' : 'Pending'}</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td style={{backgroundColor: (true ? 'white' : 'lightgrey'), opacity: (true ? '1' : '0.5')}}><a style={{pointerEvents: (true ? 'auto': 'none')}} href={`https://codeforces.com/problemset/problem/${data.id4}/${data.index4}`} target='_blank'>Problem D</a></td>
                    <td style={{backgroundColor: getBackgroundColor(Number(data.R4))}}>{data.R4}</td>
                    <td style={{backgroundColor: (solved[4] ? '#D4EDC9' : '#FFE3E3')}}>{solved[4] ? 'Accepted' : 'Pending'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
        <div className='timer-container'>
          <div style={{display:'flex', alignContent:'center', marginTop:'45px', marginLeft:'30px', fontSize:'25px'}}>
            Time : <Timer_2hr endContest={setEndContest}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartContest
