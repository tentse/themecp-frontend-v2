import React, { useState } from 'react'
import './SubNavbar.css'
import { useNavigate } from 'react-router-dom'

const SubNavbar = ({active}) => {

    const navigate = useNavigate();

    function goProfile() {
        navigate('/profile');
    }
    function goContest() {
        navigate('/contest_history');
    }
    function goImportExport() {
        navigate('/importExport');
    }
  return (
    <div className='sub-navbar'>
        <span onClick={goProfile} className={active[0] ? 'is-active' : 'not-active'}>Profile</span>
        <span onClick={goContest} className={active[1] ? 'is-active' : 'not-active'}>Contest</span>
        <span onClick={goImportExport} className={active[2] ? 'is-active' : 'not-active'}>Import/Export</span>
    </div>
  )
}

export default SubNavbar
