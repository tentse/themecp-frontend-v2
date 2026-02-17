import React from 'react'
import './Guide.css'
import add_handle from '../../assets/add_handle.jpg'
import contest from '../../assets/contest.jpg'
import level_sheet from '../../assets/level_sheet.jpg'
import profile from '../../assets/profile.png'
import start_contest from '../../assets/start_contest.jpg'

const Guide = () => {
  return (
    <div>
        <div className='guide-header'>Guide on ThemeCP</div>
        <div className='guide-container'>
            <ol>
                <li>
                    Login to ThemeCP and ADD your codeforces handle through Profile page.<br />
                    <img className='guide-pic' src={add_handle}></img>
                </li>
                <li>
                    You can explore the level_sheet page to know, which contest level will suite you the best.<br />
                    It is best recommended to go with the suggested level by ThemeCP which will be shown in the contest page.<br />
                    <img className='guide-pic' src={level_sheet}></img>
                </li>
                <li>
                    Go to contest page and enter you selected level or the level suggested by ThemeCP and start the contest. The contest duration will be 2hr.<br />
                    <img className='guide-pic' src={contest}></img>
                </li>
                <li>
                    After submitting each problem solution press the refresh button to update your solved progress.<br />
                    <img className='guide-pic' src={start_contest}></img>
                </li>
                <li>
                    After the contest is over you can go to your profile page and view your performance and rating. <br />
                    <img className='guide-pic' src={profile}></img>
                </li>
                <li>
                    <span style={{color:'red'}}>NOTE</span> : YOU CAN GIVE MULTIPLE CONTEST WITHIN ONE DAY, BUT ONLY THE CONTEST WHERE YOUR RATING DELTA IS MAXIMUM WILL BE SHOWN ON THE GRAPH.
                </li>
            </ol>
        </div>
    </div>
  )
}

export default Guide