import { createContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';

export const UserContestHistory = createContext();

const ContestHistoryContextProvider = (props) => {
    const [user_contest, setContest] = useState([]);

    useEffect(() => {
        const data = async () => {
            await fetch('https://themecp.up.railway.app/api/contestHistory', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            }) .then((res) => res.json()). then(res => setContest(res));
        }
        data();
    },[]);

    useEffect(() => {
        if (user_contest.length > 0) {
            const check = async () => {
                const user_data = await fetch('https://themecp.up.railway.app/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('token')}`,
                    },
                }) .then((res) => res.json());
                console.log(user_contest);
                const user_submission = await fetch(`https://codeforces.com/api/user.status?handle=${user_data.codeforces_handle}`).then(res => res.json());
                for (let item of user_contest) {
                    if (item.T1 === null) {
                        for (let submit of user_submission.result) {
                            if (Number(item.contestId1) === submit.problem.contestId && item.index1 === submit.problem.index && submit.verdict === "OK") {
                                console.log('here');
                                const update = await fetch(`https://themecp.up.railway.app/api/upsolved?pkid=${item.id}&id=${1}`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Bearer ${Cookies.get('token')}`,
                                    }
                                });
                            }   
                        }
                    } if (item.T2 === null) {
                        for (let submit of user_submission.result) {
                            if (Number(item.contestId2) === submit.problem.contestId && item.index2 === submit.problem.index && submit.verdict === "OK") {
                                const update = await fetch(`https://themecp.up.railway.app/api/upsolved?pkid=${item.id}&id=${2}`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Bearer ${Cookies.get('token')}`,
                                    }
                                });
                            }   
                        }
                    } if (item.T3 === null) {
                        for (let submit of user_submission.result) {
                            if (Number(item.contestId3) === submit.problem.contestId && item.index3 === submit.problem.index && submit.verdict === "OK") {
                                const update = await fetch(`https://themecp.up.railway.app/api/upsolved?pkid=${item.id}&id=${3}`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Bearer ${Cookies.get('token')}`,
                                    }
                                });
                            }   
                        }
                    } if (item.T4 === null) {
                        for (let submit of user_submission.result) {
                            if (Number(item.contestId4) === submit.problem.contestId && item.index4 === submit.problem.index && submit.verdict === "OK") {
                                const update = await fetch(`https://themecp.up.railway.app/api/upsolved?pkid=${item.id}&id=${4}`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Bearer ${Cookies.get('token')}`,
                                    }
                                });
                            }   
                        }
                    }
                }
            }
            check();
        }
    }, [user_contest])

    const contextValue = {
        user_contest,
    }

  return (
    <UserContestHistory.Provider value={contextValue}>
        {props.children}
    </UserContestHistory.Provider>
  )
}

export default ContestHistoryContextProvider
