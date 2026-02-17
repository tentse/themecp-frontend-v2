import React, { useEffect, useState } from 'react'
import './Home.css'
import discord from '../../assets/discord.jpg'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="wrapper">
          <div className="typing-demo">
            Welcome to Theme<span className='make-red'>CP</span>...
          </div>
          <div style={{display: 'flex'}}>
            <button onClick={() => navigate('/guide')} className='get-started-button'>Get Started</button>
            <button onClick={() => window.open('https://discord.gg/ncnut8Zw63','_blank')} className='discord-button'><img style={{width:'32px', borderRadius:'40px', marginRight:'5px', border:'none'}} src={discord}></img>Discord</button>
          </div>
      </div>

      <div className="description-box">
        <div className="title">
          What is Theme<span className='make-red'>CP</span>?
        </div>
        <div className="description">
          ThemeCP is an experimental training system wherein users train on a perpetual ladder for rating ranging from 800 all the way till 3500. This system is base on two-hour, four problem mashups contest, ideally to be done everyday.
        </div>
      </div>

      <div className='title-2'>
        Why does it work?
      </div>
      <div className='description-2'>
        <ul>
          <li>
            ThemeCP lets you train with problems in the entire difficulty range you have a shot at solving.
          </li>
          <li>
            This balances difficulty and skill and keeps you in the "flow state", simulating your experience in an actual contest!
          </li>
          <li>
            Your built-in strengths and weaknesses carry a +- 200 differential on any given problem! Therefore, this system exposes you to problems in the entire range you could plausibly solve in a contest.
          </li>
          <li>
            ThemeCP’s goal is to increase your chances of solving such “feasible” problems in-contest and to increase your speed in solving such problems.
          </li>
          <li>
            Furthermore, ThemeCP’s high success rate, self-balancing at around 50%, keeps your motivation high. Failures increase your success rate (literally), and successes prove your improvement!
          </li>

        </ul>

      </div>

    </div>
  )
}

export default Home
