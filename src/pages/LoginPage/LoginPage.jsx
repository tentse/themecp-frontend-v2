import React, { useEffect } from 'react'
import './LoginPage.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';



const LoginPage = () => {
    const navigate = useNavigate();
    useEffect(() => {   
        const call = async() => {
            const res = await fetch('https://themecp.up.railway.app/api/authenticate', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });
            if (res.ok) {
                navigate('/profile');
            }
        }
        call();
    },[])

    const responseMessage = async (response) => {
        const decodedToken = jwtDecode(response.credential);
        //console.log("User Info:", decodedToken);
        const { name, email, picture } = decodedToken;
        const user = {
            name : name,
            email : email,
        };
        //console.log(user);
        const getToken = await fetch(`https://themecp.up.railway.app/api/get_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        }).then((res) => res.json());
        //console.log('here');
        Cookies.set('token',getToken['token'], {expires: 30});
        const add_user = async () => {
            const res = await fetch('https://themecp.up.railway.app/api/add_user', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Cookies.get('token')}`,
              },
            });
        };
        add_user();
        alert('Logged In');
        window.location.href = 'https://themecp.vercel.app';
    };
    const errorMessage = (error) => {
        //console.log(error);
    };

  return (
    <div>
    <div className='outer-container'>

        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
        </GoogleOAuthProvider>
    </div>
    <center>
        <NavLink to="/privacy_policy"><br />By creating an account or signing you agree to our Terms and Conditions</NavLink>
        </center>
    </div>
)
}

export default LoginPage
