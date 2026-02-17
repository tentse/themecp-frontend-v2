import { createContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';

export const ProfileContext = createContext();

const ProfileContextProvider = (props) => {

    const [user_profile, setProfile] = useState([]);

    useEffect(() => {
        let data = async () => {
            await fetch('https://themecp.up.railway.app/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            }) .then((res) => res.json()) .then(res => setProfile(res));
        }
        data();
    }, [])
    const contextValue = {
        user_profile,
    }
  return (
    <ProfileContext.Provider value={contextValue}>
        {props.children}
    </ProfileContext.Provider>
  )
}

export default ProfileContextProvider
