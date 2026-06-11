import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import logo from '@/assets/logo1.png'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { logout: auth0Logout } = useAuth0()
  const { isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    setMobileMenuOpen(false)
    logout() // Clear backend token
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    })
  }

  return (
    <nav className="flex flex-col md:flex-row md:items-center md:justify-between px-4 sm:px-6 py-4 text-black bg-white">
      <div className="flex items-center justify-between">
        <img
          src={logo}
          alt="ThemeCP"
          className="w-32 sm:w-40 md:w-48 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div className={`md:flex md:items-center md:gap-1 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <ul className="flex flex-col md:flex-row list-none gap-1 md:gap-6 p-0 m-0 mt-4 md:mt-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-underline block text-inherit no-underline py-2 px-2 cursor-pointer ${isActive ? 'is-active font-bold' : ''}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/guide"
              className={({ isActive }) =>
                `nav-underline block text-inherit no-underline py-2 px-2 cursor-pointer ${isActive ? 'is-active font-bold' : ''}`
              }
            >
              Guide
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/levels"
              className={({ isActive }) =>
                `nav-underline block text-inherit no-underline py-2 px-2 cursor-pointer ${isActive ? 'is-active font-bold' : ''}`
              }
            >
              Level Sheet
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contest"
              className={({ isActive }) =>
                `nav-underline block text-inherit no-underline py-2 px-2 cursor-pointer ${isActive ? 'is-active font-bold' : ''}`
              }
            >
              Contest
            </NavLink>
          </li>
          {isAuthenticated && (
            <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `nav-underline block text-inherit no-underline py-2 px-2 cursor-pointer ${isActive ? 'is-active font-bold' : ''}`
              }
            >
              Profile
            </NavLink>
            </li>
          )}
        </ul>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 md:ml-4 w-full md:w-auto rounded-[10px] border-2 border-black bg-white px-4 py-2 text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => { setMobileMenuOpen(false); navigate('/login') }}
            className="mt-4 md:mt-0 md:ml-4 w-full md:w-auto btn-primary"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}
