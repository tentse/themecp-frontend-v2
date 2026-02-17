import React, { useContext, useEffect, useRef, useState } from 'react'
import './Contest.css'
import { LevelContext } from '../../context/LevelContext'
import Timer_2min from '../../components/Timer/Timer_2min'
import { createRoot } from 'react-dom/client';
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Contest = () => {

  const { level } = useContext(LevelContext);
  const [problemArray, setArray] = useState(['Problem 1', 'Problem 2', 'Problem 3', 'Problem 4']);
  const [suggestedLevel, setSuggestedLevel] = useState('Loading...');
  const [themecp_created, setThemecp] = useState(false);
  const [selectTag, setSelectTag] = useState('mixed');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [contest_duration, setDuration] = useState(120);
  const tags = ['mixed', 'random', 'greedy', 'brute force', 'math', 'strings', 'constructive algorithms','dp', 'graphs', 'binary search', 'bitmasks', 'data structures', 'implementation', 'trees', 'number theory', 'combinatorics', 'shortest paths', 'probabilities', 'sortings'];

  const divVal = [useRef(null), useRef(null), useRef(null), useRef(null)];;
  const problemLevel = useRef(null);
  const [Loading, setLoading] = useState(false);
  const [handle, setHandle] = useState(null);

  const handleChange = () => {
    const data = problemLevel.current.value;

    const item = level.find(item => Number(item.level) === Number(data));

    if (item) {
      setArray([item.P1, item.P2, item.P3, item.P4]);
      setDuration(() => item.time);
    } else {
      setArray(['Problem 1', 'Problem 2', 'Problem 3', 'Problem 4']);
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

  useEffect(() => {
    for (let i in problemArray) {
      divVal[i].current.textContent = problemArray[i];
    }
    
  }, [problemArray])
  
  const timer_data = useRef(null);
  const [countDown, setCountDown] = useState(false);
  const navigate = useNavigate();

  const [endCountDown, setEndCountDown] = useState(false);

  const check = async () => {

    const get_username = await fetch('https://themecp.up.railway.app/api/profile', {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    }) .then((res) => res.json()); 

    if (get_username.codeforces_handle === null) {
      alert('ADD YOUR CODEFORCES HANDLE');
      navigate('/profile');
    } else {
      setHandle(() => get_username.codeforces_handle);
    }
    
    const startTime = localStorage.getItem('2min-startTime');
    const endTime = localStorage.getItem('2min-endTime');

    if (startTime && endTime) {
      const currentTime = new Date().getTime();
      if (endTime - currentTime <= 0) {
        setCountDown(false);
        setEndCountDown(true);
      } else {
        setThemecp(true);
        setDuration(JSON.parse(localStorage.getItem('data')).duration);
        const data = JSON.parse(localStorage.getItem('data'));

        if (get_username.email !== data.user_email) {
          alert('Kindly Log in back to the email in which you have started the contest');
          navigate('/');
        }

        problemLevel.current.value = data.level;
        setArray([data.R1, data.R2, data.R3, data.R4]);
        setCountDown(true);
        if (timer_data.current) {
          timer_data.current.innerHTML = ''; // Clear the existing content
        }
        // Use createRoot to render Timer_2min
        const root = createRoot(timer_data.current); // createRoot on the target container
        root.render(<Timer_2min setEndCountDown={setEndCountDown} />);
      }
      return true;
    }
    return false;
  
  };
  useEffect (() => {
    check();
  },[themecp_created]);

  useEffect(() => {
    if (handle === null) {
      return;
    }
    const api_call = async () => {
      const contest_history = await fetch(`https://themecp.up.railway.app/api/contestHistory`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
        },
      }) .then((res) => res.json());
      if (contest_history.length === 0) {
        (async function() {
          let user_rating = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`)
            .then((res) => res.json());
          if (user_rating['result'].length === 0) {
            setSuggestedLevel(() => 1);
          } else {
            const number_of_contest = user_rating['result'].length;
            user_rating = user_rating['result'][number_of_contest - 1].newRating;
            if (number_of_contest > 0 && number_of_contest <= 5) {
              const arr = [1400, 900, 550, 300, 150, 50];
              let startingRating = 0;
              if (number_of_contest <= 5) {
                  startingRating = user_rating + arr[number_of_contest];
              }
              const scale = Math.pow(0.75, number_of_contest);
              startingRating = startingRating * (1 / (1 - scale)) - 1400 * (1 / (1 - scale) - 1);
              
              user_rating = startingRating;
            }
            
            let diff = -1;
            let level_choosen = 0;
            for (let item of level) {
              const temp_diff = Math.abs(item.Performance - user_rating);
              if (diff === -1) {
                diff = temp_diff;
                level_choosen = item.level;
              } else if (temp_diff < diff) {
                diff = temp_diff;
                level_choosen = item.level;
              }
            }
            setSuggestedLevel(() => level_choosen);
          }
        })();
      } else {
        let last_data = contest_history[0];
        let last_level = last_data.contest_level;
        let last_solve = last_data.T4;
        if (last_solve === null) {
          setSuggestedLevel(()=> Math.max(last_level - 1, 1));
        } else {
          setSuggestedLevel(() => Math.min(last_level + 1, 109));
        }
      }
    };
    api_call();
  }, [handle])

  useEffect(() => {
    if (endCountDown) {
      navigate('/start_contest');
    }
  }, [endCountDown]);

  const [user_submission, setUserSubmission] = useState(null);
  const [problemSet, setProblemset] = useState(null);
  const [allproblem, setAllproblem] = useState(null);
  const [arr_rating, setRating] = useState(null);
  const [foundproblem, setFoundproblem] = useState([true,true,true,true]);
  // let problem_selected = [];
  const [problem_selected, setProblemSelected] = useState([]);

  function getRandomProblem(index) {
    // console.log(user_submission);
    // console.log(index);
    setFoundproblem(prevItems =>
      prevItems.map((item, i) => (i === (index-1) ? false : item))
    );
    let data = JSON.parse(localStorage.getItem('data'));
    function check(value) {
      for (let item of user_submission.result) {
        if (item.problem.contestId === value.contestId && item.problem.index === value.index) {
          return false;
        }
      }
      if ((value.contestId === data.id1 && value.index === data.index1) || (value.contestId === data.id2 && value.index === data.index2) || (value.contestId === data.id3 && value.index === data.index3) || (value.contestId === data.id4 && value.index === data.index4)) {
        return false;
      }
      return true;
    }
    const max_contestid = allproblem.result.problems[0].contestId;
    for (let item of allproblem.result.problems) {
      // const acceptProbability = (item.contestId + max_contestid) / (2 * max_contestid);
      // if (Math.random() > acceptProbability) {
      //   continue;
      // }
      if (item.tags.length !== 0 && 'rating' in item && !item.tags.includes('*special') && item.rating === arr_rating[0] && check(item) && !problem_selected.includes(item)) {
        if (index === 1) {
          data.id1 = item.contestId;
          data.index1 = item.index;
        } else if (index === 2) {
          data.id2 = item.contestId;
          data.index2 = item.index;
        } else if (index === 3) {
          data.id3 = item.contestId;
          data.index3 = item.index;
        } else if (index === 4) {
          data.id4 = item.contestId;
          data.index4 = item.index;
        }
        // problem_selected.push(item);
        setProblemSelected((pre) => [...pre, item]);
        break;
      }
    }
    localStorage.setItem('data', JSON.stringify(data));
    alert(`⚠️ No problem found for ${arr_rating[index-1]} rating\nA random problem is selected for this rating.`);
  }

  function setProblem1() {
    let data = JSON.parse(localStorage.getItem('data'));
    function check(value) {
      for (let item of user_submission.result) {
        if (item.problem.contestId === value.contestId && item.problem.index === value.index) {
          return false;
        }
      }
      if ((value.contestId === data.id1 && value.index === data.index1) || (value.contestId === data.id2 && value.index === data.index2) || (value.contestId === data.id3 && value.index === data.index3) || (value.contestId === data.id4 && value.index === data.index4)) {
        return false;
      }
      return true;
    }
    let flag = false;
    const max_contestid = problemSet.result.problems[0].contestId;
    for (let item of problemSet.result.problems) {
      // const acceptProbability = (item.contestId + max_contestid) / (2 * max_contestid);
      // if (Math.random() > acceptProbability) {
      //   continue;
      // }
      if (item.tags.length !== 0 && 'rating' in item && !item.tags.includes('*special') && item.rating === arr_rating[0] && check(item) && !problem_selected.includes(item)) {
        data.id1 = item.contestId;
        data.index1 = item.index;
        flag = true;
        // problem_selected.push(item);
        setProblemSelected((pre) => [...pre, item]);
        localStorage.setItem('data', JSON.stringify(data));
        break;
      }
    }
    if (!flag) {
      getRandomProblem(1);
    }
  }
  function setProblem2() {
    let data = JSON.parse(localStorage.getItem('data'));
    function check(value) {
      for (let item of user_submission.result) {
        if (item.problem.contestId === value.contestId && item.problem.index === value.index) {
          return false;
        }
      }
      if ((value.contestId === data.id1 && value.index === data.index1) || (value.contestId === data.id2 && value.index === data.index2) || (value.contestId === data.id3 && value.index === data.index3) || (value.contestId === data.id4 && value.index === data.index4)) {
        return false;
      }
      return true;
    }
    let flag = false;
    const max_contestid = problemSet.result.problems[0].contestId;
    for (let item of problemSet.result.problems) {
      // const acceptProbability = (item.contestId + max_contestid) / (2 * max_contestid);
      // if (Math.random() > acceptProbability) {
      //   continue;
      // }
      if (item.tags.length !== 0 && 'rating' in item && !item.tags.includes('*special') && item.rating === arr_rating[1] && check(item) && !problem_selected.includes(item)) {
        data.id2 = item.contestId;
        data.index2 = item.index;
        flag = true;
        // problem_selected.push(item);
        localStorage.setItem('data', JSON.stringify(data));
        setProblemSelected((pre) => [...pre, item]);
        break;
      }
    }
    if (!flag) {
      getRandomProblem(2);
    }
  }
  function setProblem3() {
    let data = JSON.parse(localStorage.getItem('data'));
    function check(value) {
      for (let item of user_submission.result) {
        if (item.problem.contestId === value.contestId && item.problem.index === value.index) {
          return false;
        }
      }
      if ((value.contestId === data.id1 && value.index === data.index1) || (value.contestId === data.id2 && value.index === data.index2) || (value.contestId === data.id3 && value.index === data.index3) || (value.contestId === data.id4 && value.index === data.index4)) {
        return false;
      }
      return true;
    }
    let flag = false;
    const max_contestid = problemSet.result.problems[0].contestId;
    for (let item of problemSet.result.problems) {
      // const acceptProbability = (item.contestId + max_contestid) / (2 * max_contestid);
      // if (Math.random() > acceptProbability) {
      //   continue;
      // }
      if (item.tags.length !== 0 && 'rating' in item && !item.tags.includes('*special') && item.rating === arr_rating[2] && check(item) && !problem_selected.includes(item)) {
        data.id3 = item.contestId;
        data.index3 = item.index;
        flag = true;
        // problem_selected.push(item);
        setProblemSelected((pre) => [...pre, item]);
        localStorage.setItem('data', JSON.stringify(data));
        break;
      }
    }
    if (!flag) {
      getRandomProblem(3);
    }
  }
  function setProblem4() {
    let data = JSON.parse(localStorage.getItem('data'));
    function check(value) {
      for (let item of user_submission.result) {
        if (item.problem.contestId === value.contestId && item.problem.index === value.index) {
          return false;
        }
      }
      if ((value.contestId === data.id1 && value.index === data.index1) || (value.contestId === data.id2 && value.index === data.index2) || (value.contestId === data.id3 && value.index === data.index3) || (value.contestId === data.id4 && value.index === data.index4)) {
        return false;
      }
      return true;
    }
    let flag = false;
    const max_contestid = problemSet.result.problems[0].contestId;
    for (let item of problemSet.result.problems) {
      // const acceptProbability = (item.contestId + max_contestid) / (2 * max_contestid);
      // if (Math.random() > acceptProbability) {
      //   continue;
      // }
      if (item.tags.length !== 0 && 'rating' in item && !item.tags.includes('*special') && item.rating === arr_rating[3] && check(item) && !problem_selected.includes(item)) {
        data.id4 = item.contestId;
        data.index4 = item.index;
        flag = true;
        // console.log(problem_selected);
        // problem_selected.push(item);
        localStorage.setItem('data', JSON.stringify(data));
        setProblemSelected((pre) => [...pre, item]);
        break;
      }
    }
    if (!flag) {
      getRandomProblem(4);
    }
  }

  useEffect(() => {
    if (user_submission === null || allproblem === null || arr_rating === null) {
      return;
    } else {
      setProblem1();
      setProblem2();
      setProblem3();
      setProblem4();
      setLoading(false);
    }
  }, [user_submission, allproblem, arr_rating])

  const getProblems = async (data) => {
    function shuffleArray(arr) {
      // console.log(arr.length);
      // console.log(arr.length/1.4);
      for (let i = Math.max(1, (Math.round(arr.length / 4) - 1)); i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      // conssole.log(arr)
    }
    let user_submission = await fetch(`https://codeforces.com/api/user.status?handle=${data.handle}`)
      .then((res) => res.json());
    setUserSubmission(user_submission);
    let problemSet;
    if (selectTag === 'mixed') {
      problemSet = await fetch(`https://codeforces.com/api/problemset.problems`)
        .then((res) => res.json());
    }
    else {
      let TAG;
      if (selectTag === 'random') {
        let random_select = tags[Math.floor(Math.random() * (tags.length - 2)) + 2];
        // if (random_select === 'random' || random_select === 'mixed') {
        //   random_select = tags[4];
        // }
        setSelectTag(() => random_select);
        let data = JSON.parse(localStorage.getItem('data'));
        data.topic = random_select;
        localStorage.setItem('data', JSON.stringify(data));
        TAG = random_select.replace(' ' , '+');
      }
      else {
        TAG = selectTag.replace(' ', '+');
      }
      problemSet = await fetch(`https://codeforces.com/api/problemset.problems?tags=${TAG}`)
      .then((res) => res.json());
      // //console.log(problemSet);
    }
    shuffleArray(problemSet.result.problems);
    setProblemset(problemSet);
    const arr_rating = [Number(data.R1), Number(data.R2), Number(data.R3), Number(data.R4)];
    setRating(arr_rating);
    problemSet = await fetch(`https://codeforces.com/api/problemset.problems`)
        .then((res) => res.json());
    shuffleArray(problemSet.result.problems);
    setAllproblem(() => problemSet);
    // console.log(problemSet.result);
  }

  async function createThemecp() {
    if (problemArray[0] === 'Problem 1') {
      alert('Please Select Contest Level');
      return;
    }
    else {
      setLoading(true);
      if (!await check()) {
        const get_username = await fetch('https://themecp.up.railway.app/api/profile', {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`,
          },
        }) .then((res) => res.json());
        let data = {};
        data.duration = contest_duration;
        data.user_email = get_username.email;
        data.handle = get_username.codeforces_handle;
        data.topic = selectTag;
        data.date = null;
        data.level = problemLevel.current.value;
        data.R1 = divVal[0].current.textContent;
        data.R2 = divVal[1].current.textContent;
        data.R3 = divVal[2].current.textContent;
        data.R4 = divVal[3].current.textContent;
        data.id1 = null;
        data.id2 = null;
        data.id3 = null;
        data.id4 = null;
        data.index1= null;
        data.index2 = null;
        data.index3 = null;
        data.index4= null;
        data.T1 = null;
        data.T2 = null;
        data.T3 = null;
        data.T4 = null;
        localStorage.setItem('data', JSON.stringify(data));

        await getProblems(data);

        ////console.log(data);

        setThemecp(() => true);

      }
    }
  }

  async function handleClick(){
    
    if (!await check()) {
      const userResponse = window.confirm(`Once contest started you can't stop the contest.\nARE YOU READY TO START THE CONTEST?`);
      if (!userResponse) {
        //console.log(JSON.parse(localStorage.getItem('data')));
        return;
      }
      setEndCountDown(false);
      setCountDown(true);
      if (timer_data.current) {
        timer_data.current.innerHTML = '';
      };
      // let data = JSON.parse(localStorage.getItem('data')) || {};

      // //console.log(data);
      const root = createRoot(timer_data.current);
      root.render(<Timer_2min setEndCountDown={setEndCountDown}/>);
    }
    
  }

  const handleTagSelect = (tag) => {
    setSelectTag(() => tag);
    setIsDropdownOpen(false);
  }
  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const reroll = (index) => {
    if (countDown) {
      return;
    }
    const userResponse = window.confirm(`Do you want to reroll problem ${index}`);
      if (!userResponse) {
        return;
      } 
      //console.log(problem_selected);
      if (index === 1) {
        setProblem1();
      } else if (index === 2) {
        setProblem2();
      } else if (index === 3) {
        setProblem3();
      } else if (index === 4) {
        setProblem4();
      }
      // alert(`Problem ${index} have been rerolled`);
      //console.log(problem_selected);
    }
    useEffect(() => {
      if (problem_selected.length > 4) {
        alert(`Problem have been changed`);
        // console.log(problem_selected);
    }
  }, [problem_selected])

  const toproblem = (index) => {
    const data = JSON.parse(localStorage.getItem('data'));
    if (index === 1) {
      window.open(`https://codeforces.com/problemset/problem/${data.id1}/${data.index1}`, '_blank');
    } else if (index === 2) {
      window.open(`https://codeforces.com/problemset/problem/${data.id2}/${data.index2}`, '_blank');
    } else if (index === 3) {
      window.open(`https://codeforces.com/problemset/problem/${data.id3}/${data.index3}`, '_blank');
    } else if (index === 4) {
      window.open(`https://codeforces.com/problemset/problem/${data.id4}/${data.index4}`, '_blank');
    }
  }

  const custom = (index) => {
    if (countDown) {
      return;
    }
    const data = JSON.parse(localStorage.getItem('data'));
    const contestId = prompt('Enter contestId : \nEx: codeforces.com/problemset/problem/2047/B \nContestId=2047');
    if (contestId === null) {
      return;
    }
    const contest_index = prompt('Enter index : \nEx: codeforces.com/problemset/problem/2047/B \nIndex=B').toUpperCase();
    if (contest_index === null) {
      return;
    }
    for (let item of allproblem.result.problems) {
      if (item.contestId === Number(contestId) && item.index === contest_index && item.rating === arr_rating[index-1]) {
        if (index === 1) {
          data.id1 = Number(contestId);
          data.index1 = contest_index;
        } else if (index === 2) {
          data.id2 = Number(contestId);
          data.index2 = contest_index;
        } else if (index === 3) {
          data.id3 = Number(contestId);
          data.index3 = contest_index;
        } else if (index === 4) {
          data.id4 = Number(contestId);
          data.index4 = contest_index;
        }
        setProblemSelected((pre) => [...pre, item]);
        localStorage.setItem('data', JSON.stringify(data));
        return;
      } 
    }
    alert(`Problem couldn't be set!\nRating doesn't match`);
  }

  return (
    <center>
      <div className='main-container'>
        <div className='input-container'>
          <label>Enter Contest Level : </label>
          <input disabled={themecp_created} maxLength={3} ref={problemLevel} onChange={handleChange} type="text" className='level-input' placeholder='Ex : 23..'></input>
        </div>
        {!themecp_created ? <p style={{textAlign: 'left', marginTop:'5px'}}>Suggested Level by ThemeCP : {suggestedLevel}</p> : ''}
        {!themecp_created ? <p style={{textAlign: 'left', fontSize:'16px', marginBottom:'30px', color:'red'}}>If suggested level is too easy/hard, you can choose an appropriate level from <NavLink to='/level_sheet'><span style={{fontSize:'17px'}}>level sheet</span></NavLink></p> : ''}
        <button disabled={themecp_created} className="dropdown-btn" onClick={toggleDropdown}>
          {selectTag ? `Theme : ${selectTag}` : 'empty'}
        </button>
        {isDropdownOpen && (
        <div className="dropdown-menu">
            <ul>
              {tags.map((tag) => (
                <li key={tag}>
                  <label>
                    <input
                      type="radio" // Use radio buttons to allow only one selection
                      checked={selectTag === tag} // Check if the tag is selected
                      onChange={() => handleTagSelect(tag)} // Select the tag when clicked
                    />
                    {tag}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}


        <div className='problem-container'>
          <div className='rating-label'>Problem Rating : </div>
          {problemArray.map((problem, index) => (
            <div key={index} ref={divVal[index]} className='problem-box' style={{ backgroundColor: getBackgroundColor(problemArray[index])}}>
              {problemArray[index]}
            </div>
          ))}
        </div>
        {themecp_created ? <>
          <div className='link-container'>
            <div className='rating-label'>Problem Content:</div>
            <div className='link-box' onClick={() => toproblem(1)} style={{ backgroundColor: getBackgroundColor(problemArray[0])}}>
              {foundproblem[0] ? '' : '⚠️'}Problem 1
            </div>
            <div className='link-box' onClick={() => toproblem(2)} style={{ backgroundColor: getBackgroundColor(problemArray[1])}}>
              {foundproblem[1] ? '' : '⚠️'}Problem 2
            </div>
            <div className='link-box' onClick={() => toproblem(3)} style={{ backgroundColor: getBackgroundColor(problemArray[2])}}>
              {foundproblem[2] ? '' : '⚠️'}Problem 3
            </div>
            <div className='link-box' onClick={() => toproblem(4)} style={{ backgroundColor: getBackgroundColor(problemArray[3])}}>
              {foundproblem[3] ? '' : '⚠️'}Problem 4
            </div>
          </div>
          <div className='reroll-container'>
            <div className='rating-label'>ReRoll Problem :</div>
            <div className='reroll-box' onClick={() => reroll(1)} style={{ backgroundColor: getBackgroundColor(problemArray[0])}}>
              reroll 1
            </div>
            <div className='reroll-box' onClick={() => reroll(2)} style={{ backgroundColor: getBackgroundColor(problemArray[1])}}>
              reroll 2
            </div>
            <div className='reroll-box' onClick={() => reroll(3)} style={{ backgroundColor: getBackgroundColor(problemArray[2])}}>
              reroll 3
            </div>
            <div className='reroll-box' onClick={() => reroll(4)} style={{ backgroundColor: getBackgroundColor(problemArray[3])}}>
              reroll 4
            </div>
          </div>
          <div className='reroll-container'>
            <div className='rating-label'>Custom Problem :</div>
            <div className='reroll-box' onClick={() => custom(1)} style={{ backgroundColor: getBackgroundColor(problemArray[0])}}>
              Custom 1
            </div>
            <div className='reroll-box' onClick={() => custom(2)} style={{ backgroundColor: getBackgroundColor(problemArray[1])}}>
              Custom 2
            </div>
            <div className='reroll-box' onClick={() => custom(3)} style={{ backgroundColor: getBackgroundColor(problemArray[2])}}>
              Custom 3
            </div>
            <div className='reroll-box' onClick={() => custom(4)} style={{ backgroundColor: getBackgroundColor(problemArray[3])}}>
              Custom 4
            </div>
          </div>
          </> 
          : <></>}
        
        <div style={{marginTop: '50px'}}>Contest Duration : {contest_duration} min</div>
        {themecp_created ? (<><div className='twoMin-container' ref={timer_data}>{Loading ? 'Loading...' : 'Contest Starts in 15sec before starting the contest'}</div>
        <div className='button-container'>
          <button disabled={countDown} onClick={handleClick} className='start-button'>Start</button>
        </div></>) : (<>{Loading ? <div className='generating-message'>Generating ThemeCP...</div> : <div className='button-container'> <button onClick={createThemecp} className='themecp-button'>Create ThemeCP</button> </div>}</>)}
        
      </div>
    </center>
  )
}

export default Contest
