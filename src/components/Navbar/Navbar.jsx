import React, { useEffect, useState } from 'react'
import logo from '../../assets/logo1.png'
import './Navbar.css'
import { NavLink, useNavigate } from 'react-router-dom'
import LogIn from '../UserButton/LogIn'
import Logout from '../UserButton/Logout'

const Navbar = ({auth}) => {

  const navigate = useNavigate();

  const [isAuth, setAuth] = useState(false);
  useEffect(() => {
    setAuth(auth);
  },[auth]);


  return (
    <div className='navbar'>
      <img src={logo} className='logo' onClick={() => navigate('/')}></img>
      <div className='nav-right'>
        <ul className="nav-links">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/guide">Guide</NavLink>
          </li>
          <li>
            <NavLink to="/level_sheet">Level Sheet</NavLink>
          </li>
          <li>
            <NavLink to="/contest">Contest</NavLink>
          </li>
          {isAuth ? <li>
            <NavLink to="/profile">Profile</NavLink>
          </li> : null}
        </ul>
        {isAuth ? <Logout setAuth={setAuth}/> : <LogIn setAuth={setAuth} />}
      </div>
    </div>
  )
}

export default Navbar
