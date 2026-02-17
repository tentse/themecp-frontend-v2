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
    <nav className="flex flex-col md:flex-row md:items-center md:justify-between px-4 sm:px-6 py-4 text-black border-b border-gray-100 bg-white">
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
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                `block text-inherit no-underline py-2 px-2 transition-colors ${isActive ? 'font-semibold border-b-2 border-black -mb-0.5' : 'hover:text-gray-600'}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/guide"
              className={({ isActive }) =>
                `block text-inherit no-underline py-2 px-2 transition-colors ${isActive ? 'font-semibold border-b-2 border-black -mb-0.5' : 'hover:text-gray-600'}`
              }
            >
              Guide
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/levels"
              className={({ isActive }) =>
                `block text-inherit no-underline py-2 px-2 transition-colors ${isActive ? 'font-semibold border-b-2 border-black -mb-0.5' : 'hover:text-gray-600'}`
              }
            >
              Level Sheet
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contest"
              className={({ isActive }) =>
                `block text-inherit no-underline py-2 px-2 transition-colors ${isActive ? 'font-semibold border-b-2 border-black -mb-0.5' : 'hover:text-gray-600'}`
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
                `block text-inherit no-underline py-2 px-2 transition-colors ${isActive ? 'font-semibold border-b-2 border-black -mb-0.5' : 'hover:text-gray-600'}`
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
            className="mt-4 md:mt-0 md:ml-4 w-full md:w-auto rounded-xl border border-gray-200 px-4 py-2 hover:bg-gray-50 active:scale-95 transition-all"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => { setMobileMenuOpen(false); navigate('/login') }}
            className="mt-4 md:mt-0 md:ml-4 w-full md:w-auto rounded-xl bg-black px-5 py-2 text-white hover:bg-gray-800 active:scale-95 transition-all"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}
