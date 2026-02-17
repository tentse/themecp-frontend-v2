import React from 'react'
import './Logout.css'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Logout = ({setAuth}) => {
    const navigate = useNavigate();
    const handleClick = async () => {
        try {
            alert('Logged Out');
            Cookies.remove('token');
            navigate(0);
            navigate('/');
            // window.location.href = 'https://themecp.vercel.app/';
          } catch(error) {
            //console.error('Erro while checking authentication : ', error);
            setAuth(true);
            navigate(0);
            navigate('/');
            // window.location.href = 'https://themecp.vercel.app/';
          }
    }
  return (
    <div>
      <button onClick={handleClick} className='logout-button'>Logout</button>
    </div>
  )
}

export default Logout
