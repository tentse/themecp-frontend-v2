import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation  } from 'react-router-dom'; // Import Navigate for redirect
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Level_Sheet from './pages/Level_Sheet/Level_Sheet';
import LevelContextProvider from './context/LevelContext';
import ProfileContextProvider from './context/ProfileContext/ProfileContext';
import ContestHistoryContextProvider from './context/ProfileContext/ContestHistoryContext';
import Contest from './pages/Contest/Contest';
import StartContest from './pages/StartContest/StartContest';
import Profile from './pages/Profile/Profile';
import SubNavbar from './components/SubNavbar/SubNavbar';
import ContestHistory from './pages/Profile/ContestHistory';
import LoginPage from './pages/LoginPage/LoginPage';
import Guide from './pages/Guide/Guide';
import Cookies from 'js-cookie';
import P from './pages/PrivacyPolicy/P';
import ReactGA from 'react-ga4';
import ImportExport from './components/ImportExport/ImportExport';

const PageViewTracker = () => {
  const location = useLocation(); // Hook to get the current location (route)
  // console.log(location);
  useEffect(() => {
    // Initialize GA4 with your tracking ID (replace 'G-XXXXXXXXXX' with your actual GA4 ID)
    ReactGA.initialize(import.meta.env.VITE_GA4_ID); 

    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title, // Optional, you can pass a custom title
    });
  }, [location]); // Effect runs whenever the route/location changes

  return null; // This component doesn't render anything, it's only for tracking
};

const App = () => {
  
  const [isAuth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://themecp.up.railway.app/api/authenticate', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`,
          },
        });
        if (response.ok) {
          setAuth(true);
        } else {
          setAuth(false);
        }
      } catch (error) {
        //console.error('Error while checking authentication:', error);
        setAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // No need to track `isAuth` in the dependency array here

  // PrivateRoute component to handle protected routes
  const PrivateRoute = ({ element }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    return isAuth ? element : <Navigate to="/login" replace />;
  };

  return (
    <>
      {/* <Analytics /> */}
      {/* <SpeedInsights /> */}
      <LevelContextProvider>
      <ProfileContextProvider>
      <ContestHistoryContextProvider>
      <PageViewTracker />
        <Routes>
          <Route path="/" element={
            <div>
              <Navbar auth={isAuth}/>
              <Home />
            </div>
          } />
          <Route path="/level_sheet" element={
            <div>
              <Navbar auth={isAuth}/>
              <Level_Sheet />
            </div>
          } />
          <Route path="/privacy_policy" element={
            <div>
              <Navbar auth={isAuth}/>
              <P />
            </div>
          } />
          <Route path="/guide" element={
            <div>
              <Navbar auth={isAuth}/>
              <Guide />
            </div>
          } />
          
          {/* Use PrivateRoute to protect these routes */}
          <Route path="/contest" element={<PrivateRoute element={<div><Navbar auth={isAuth}/><Contest /></div>} />} />
          <Route path="/start_contest" element={<PrivateRoute element={<div><Navbar auth={isAuth}/> <StartContest /></div>} />} />
          <Route path="/profile" element={<PrivateRoute element={<div><Navbar auth={isAuth}/><SubNavbar active={[true, false, false]} /><Profile /></div>} />} />
          <Route path="/contest_history" element={<PrivateRoute element={<div><Navbar auth={isAuth}/><SubNavbar active={[false, true, false]} /><ContestHistory /></div>} />} />
          <Route path="/importExport" element={<PrivateRoute element={<div><Navbar auth={isAuth}/><SubNavbar active={[false, false, true]} /><ImportExport /></div>} />} />
          
          <Route path="/login" element={
            <div>
              <Navbar auth={isAuth}/>
              <LoginPage />
            </div>
          } />
        </Routes>
      </ContestHistoryContextProvider>
      </ProfileContextProvider>
      </LevelContextProvider>
    </>
  );
};

export default App;
