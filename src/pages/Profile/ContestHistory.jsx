import React, { useState, useEffect, useContext } from 'react'
import './ContestHistory.css'
import { UserContestHistory } from '../../context/ProfileContext/ContestHistoryContext';

const ContestHistory = () => {

  const [user_contest, setContestHistory] = useState([]);
  const contest_history = useContext(UserContestHistory);
  useEffect(() => {
      setContestHistory(() => contest_history.user_contest);
  }, [contest_history]);

  function getDeltaColor(data) {
    if (data === 0)
      return 'black';
    else if (data > 0)
      return 'green';
    else
      return 'red';
  }
  function getSign(data) {
    if (data > 0)
      return '+';
  }
  function getSolvedColor(data) {
    if (data === null) {
      return '#FFE3E3';
    } else if (Number(data) === -1) {
      return '#FFCC88'
    } 
    else {
      return '#D4EDC9';
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
  const getPerformanceColor = (data) => {
    const rating = parseInt(data);
    if (rating > 0 && rating < 1200) {
        return '#808080';
    } else if (rating >= 1200 && rating < 1400) {
        return '#008000';
    } else if (rating >= 1400 && rating < 1600) {
        return '#03A89E';
    } else if (rating >= 1600 && rating < 1900) {
        return '#0000FF';
    } else if (rating >= 1900 && rating < 2100) {
        return '#AA00AA';
    } else if (rating >= 2100 && rating < 2300) {
        return '#FF8C00';
    } else if (rating >= 2300 && rating < 2400) {
        return '#FF8C00';
    } else if (rating >= 2400 && rating < 2600) {
        return '#FF0000';
    } else if (rating >= 2600 && rating < 3000) {
        return '#FF0000';
    } else if (rating >= 3000) {
        return '#FF0000';
    } else {
        return 'black';
    }
  }

  return (
    <div className='contest-history-container'>
      Contest History
      <div className='contest-history-table'>
        <div style={{alignItems:'center', height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>ID</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Date</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Topic</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Level</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>R1</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>R2</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>R3</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>R4</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>T1</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>T2</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>T3</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>T4</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Perf</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Rating</div>
        <div style={{alignItems:'center',height:'35px',display:'flex', justifyContent:'center'}}>Δ</div>  
      </div>

        {
          user_contest.map((item, index) => (
            <div className='contest-history-table-data' key={index}>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>{item.contest_no + 1}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.date}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.topic}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>{item.contest_level}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getBackgroundColor(item.R1)}}><a href={`https://codeforces.com/problemset/problem/${item.contestId1}/${item.index1}`} target='_blank'>{item.R1}</a></div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getBackgroundColor(item.R2)}}><a href={`https://codeforces.com/problemset/problem/${item.contestId2}/${item.index2}`} target='_blank'>{item.R2}</a></div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getBackgroundColor(item.R3)}}><a href={`https://codeforces.com/problemset/problem/${item.contestId3}/${item.index3}`} target='_blank'>{item.R3}</a></div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getBackgroundColor(item.R4)}}><a href={`https://codeforces.com/problemset/problem/${item.contestId4}/${item.index4}`} target='_blank'>{item.R4}</a></div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getSolvedColor(item.T1)}}>{item.T1 === null ? 'null' : (Number(item.T1) === -1 ? '*' : item.T1)}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getSolvedColor(item.T2)}}>{item.T2 === null ? 'null' : (Number(item.T2) === -1 ? '*' : item.T2)}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getSolvedColor(item.T3)}}>{item.T3 === null ? 'null' : (Number(item.T3) === -1 ? '*' : item.T3)}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getSolvedColor(item.T4)}}>{item.T4 === null ? 'null' : (Number(item.T4) === -1 ? '*' : item.T4)}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', color: getPerformanceColor(item.performance), fontWeight: 'bold'}}>~{item.performance}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>{item.rating}</div>
              <div style={{fontWeight:'bold', alignItems:'center', height: '30px',display:'flex', justifyContent:'center', color: getDeltaColor(item.delta)}}>{getSign(item.delta)}{item.delta}</div>
            </div>
          ))
        }
      
    </div>
  )
}

export default ContestHistory
