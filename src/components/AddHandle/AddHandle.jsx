import React, { useEffect, useRef, useState } from 'react'
import './AddHandle.css'
import Cookies from 'js-cookie';

const AddHandle = () => {

    const [handle, setHandle] = useState(null);
    const [problemLink, setLink] = useState(null);
    const [user, setUser] = useState(null);
    const [problem, setProblem] = useState(null);
    const [checking, setChecking] = useState(false);
    const [Loading, setLoading] = useState(false);
    
    const get_handle = useRef(null);
    
    const addHandle = async () => {
        let user_handle = await get_handle.current.value.trim();
        console.log(user_handle);
        setUser(() => user_handle);
        setLoading(() => true);
        let problem_api = await fetch('https://codeforces.com/api/problemset.problems');
        let submission = await fetch(`https://codeforces.com/api/user.status?handle=${user_handle}&count=1`);
        setLoading(() => false);
        problem_api = await problem_api.json();
        submission = await submission.json();
        let prob = null;
        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                // Generate a random index
                const j = Math.floor(Math.random() * (i + 1));
    
                // Swap elements at index i and j
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        shuffleArray(problem_api['result']['problems']);
        for (let i of problem_api['result']['problems']) {
            if (submission.result.length === 0 || (i['contestId'] !== submission['result'][0]['problem']['contestId']) && (i['index'] !== submission['result'][0]['problem']['index'])) {
                prob = i;
                setProblem(() => prob);
                break;
            }
        }
    }
    
    useEffect(() => {
        if (problem !== null) {
            setChecking(true);
            const url = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
            setLink(`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`);
            const check_user = async () => {
                const api = await fetch(`https://codeforces.com/api/user.status?handle=${user}&count=1`);
                const submission = await api.json();
                let flag = false;
                for (let i of submission['result']) {
                    if ((i['problem']['contestId'] === problem['contestId']) && (i['problem']['index'] === problem['index']) && (i['verdict'] === 'COMPILATION_ERROR')) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    const user_handle = await get_handle.current.value.trim();
                    setHandle(user_handle);
                }
                else {
                    alert('Handle Verification Failed. TRY AGAIN');
                    window.location.href = 'https://themecp.vercel.app/profile';
                }
                setChecking(false);
            };
            setTimeout(check_user, 60000);
        }
    }, [problem]);

    useEffect(() => {
        if (handle !== null) {
            const data = {};
            data.handle = handle;
            const addHandle = async () => {
                const res = await fetch('https://themecp.up.railway.app/api/addHandle', {
                    method:'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Cookies.get('token')}`,
                    },
                    body: JSON.stringify(data),
                }).then((res) => res.json());
                //console.log(res);
                if (res['message'] === 'handle already exist') {
                    alert('Handle Already Exists');
                    window.location.href = 'https://themecp.vercel.app/profile';
                } else {
                    alert('successful');
                    window.location.href = 'https://themecp.vercel.app/profile';
                }
            }
            addHandle();
        }
    }, [handle]);

  return (
    <div>
        <input disabled={checking} type='text' className='handle-input' placeholder='Codeforces Handle...' ref={get_handle}></input>
        <button disabled={checking} onClick={addHandle} className='handle-button'>Add Handle</button>
        <div>{Loading ? 'Loading...' : (problemLink !== null ? <a href={problemLink} target='_blank'>CLICK HERE : Submit a COMPILATION_ERROR within 1 minute.<br></br> DO NOT REFRESH OR CHANGE THE PAGE</a> : '')}</div>
    </div>
  )
}

export default AddHandle
