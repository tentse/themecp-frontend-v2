import React from 'react'
import './LogIn.css'
import { useNavigate } from 'react-router-dom';


const LogIn = () => {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/login');
        return;
    };
      

  return (
    <div>
      <button onClick={handleClick} className='login-button'>Login</button>
    </div>
  )
}

export default LogIn
