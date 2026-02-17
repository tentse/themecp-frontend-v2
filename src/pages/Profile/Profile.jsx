import React, { useContext, useEffect, useState } from 'react'
import './Profile.css'
import rating_pic from '../../assets/rating.png'
import star from '../../assets/star.png'
import ChartData from '../../components/Chart/ChartData'
import AddHandle from '../../components/AddHandle/AddHandle'
import mail from '../../assets/mail.png'
import Donation from '../../components/Donation/Donation'
import { ProfileContext } from '../../context/ProfileContext/ProfileContext'
import { UserContestHistory } from '../../context/ProfileContext/ContestHistoryContext'
import PieData from '../../components/Chart/Pie/PieData'

const Profile = () => {

    const [user_profile, setProfile] = useState(null);
    const [user_contest, setContestHistory] = useState([]);
    const [cf_contest, setCFcontest] = useState([]);
    const [contestAttempt, setAttempt] = useState(0);
    const [rating, setRating] = useState(0);
    const [best_performance, setBestPerformance] = useState(0);
    const [maxRating, setMaxRating] = useState(0);
    const [isChecked, setChecked] = useState(false);
    
    const profile = useContext(ProfileContext);
    const contest_history = useContext(UserContestHistory);
    useEffect(() => {
        setProfile(() => profile.user_profile);
        setContestHistory(() => contest_history.user_contest);
    }, [profile, contest_history]);

    useEffect(() => {
        if (user_profile === null)
            return;
        else if (!isChecked) {
            setCFcontest(() => []);
        }
        const get_user_profile = async() => {
            if (user_profile.codeforces_handle === null)
                return;
            let data = await fetch(`https://codeforces.com/api/user.rating?handle=${user_profile.codeforces_handle}`)
                .then((res) => res.json());
            const cf_contest_history = [];
            for (let item of data.result) {
                const temp_obj = {};
                temp_obj.rating = item.newRating;
                let timestamp = item.ratingUpdateTimeSeconds;

                // Convert timestamp to Date object (in milliseconds)
                let date = new Date(timestamp * 1000);

                // Get the components of the date
                let year = date.getFullYear();
                let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                let day = String(date.getDate()).padStart(2, '0');
                temp_obj.date = `${year}-${month}-${day}`;
                cf_contest_history.push(temp_obj);
            }
            setCFcontest(() => cf_contest_history);
        }
        get_user_profile();
    },[user_profile, isChecked]);

    useEffect(() => {
        setAttempt(user_contest.length);
        if (contestAttempt > 0) {
          const currentRating = user_contest[0].rating;
          setRating(currentRating);
    
          const bestPerf = Math.max(...user_contest.map(obj => obj.performance));
          setBestPerformance(bestPerf);
    
          const maxRtg = Math.max(...user_contest.map(obj => obj.rating));
          setMaxRating(maxRtg);
        }
      }, [user_contest, contestAttempt]); 
    
      
      const handleCheckBox = (event) => {
        setChecked(() => event.target.checked);
      }

    const getBackgroundColor = (data) => {
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

    const getRatingName = (data) => {
        const rating = parseInt(data);
        if (rating > 0 && rating < 1200) {
            return 'Newbie';
        } else if (rating >= 1200 && rating < 1400) {
            return 'Pupil';
        } else if (rating >= 1400 && rating < 1600) {
            return 'Specialist';
        } else if (rating >= 1600 && rating < 1900) {
            return 'Expert';
        } else if (rating >= 1900 && rating < 2100) {
            return 'Candidate master';
        } else if (rating >= 2100 && rating < 2300) {
            return 'Master';
        } else if (rating >= 2300 && rating < 2400) {
            return 'International master';
        } else if (rating >= 2400 && rating < 2600) {
            return 'Grandmaster';
        } else if (rating >= 2600 && rating < 3000) {
            return 'International grandmaster';
        } else if (rating >= 3000) {
            return 'Lengendary grandmaster';
        } else {
            return 'Unrated'
        }
    }
    return (
        <div className='profile-main-container'>
            <div>
                <div className='user-profile-data'>
                    <p style={{marginBottom: '2px', color: getBackgroundColor(rating), fontSize:'23px'}}>{getRatingName(rating)}</p>
                    <p style={{marginTop: '10px', fontWeight:'bolder' ,fontSize:'38px', color: getBackgroundColor(rating)}}>{(user_profile !== null && user_profile.codeforces_handle !== null) ? user_profile.codeforces_handle : <AddHandle />}</p>
                    <p style={{verticalAlign:'middle'}}><span style={{fontWeight: 'normal'}}><img src={rating_pic} className='rating-logo'></img> Contest Rating</span>: <span style={{color:getBackgroundColor(rating)}}>{rating}</span> <span style={{fontSize:'16px'}}>(max. <span style={{color:getBackgroundColor(maxRating), fontSize:'16px'}}>{getRatingName(maxRating).toLocaleLowerCase()}, <span style={{color:getBackgroundColor(maxRating), fontSize:'16px'}}>{maxRating}</span></span>)</span></p>
                    <p style={{verticalAlign:'middle'}}><span style={{fontWeight:'normal'}}><img src={star} className='rating-logo'></img> Best Performace</span>: <span style={{color: getBackgroundColor(best_performance)}}>{best_performance}</span></p>
                    <p style={{verticalAlign:'middle'}}><span style={{fontWeight:'normal'}}><img src={star} className='rating-logo'></img> Contest attempt</span>: {contestAttempt}</p>
                    <p style={{verticalAlign:'middle'}}><span style={{fontWeight:'normal'}}><img src={mail} className='rating-logo'></img> Email</span>: {user_profile !== null ? user_profile.email : 'Email'}</p>
                </div>
                <div className='user-rating-graph'>
                    <center><div className='add-cf-graph'><input type='checkbox' checked={isChecked} onChange={handleCheckBox} />Plot CF rating graph</div></center>
                    {user_contest === null ? 'Loading' : <ChartData user_contest={user_contest} cf_contest={isChecked ? cf_contest : []} /> }
                </div>
                <div className='user-rating-graph'>
                    {user_contest === null ? 'Loading' :  <PieData user_contest={user_contest} /> }
                </div>
            </div>
            <Donation />
        </div>
    )
}

export default Profile
