import { NavLink, useNavigate } from 'react-router-dom'
import logo from '@/assets/logo1.png'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="flex items-center justify-between px-6 py-2 text-black">
      <img
        src={logo}
        alt="ThemeCP"
        className="w-[200px] cursor-pointer md:w-[200px] sm:w-[100px]"
        onClick={() => navigate('/')}
      />
      <div className="flex items-center gap-1">
        <ul className="flex list-none gap-6 p-0 m-0 sm:gap-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block text-inherit no-underline hover:underline ${isActive ? 'font-bold' : ''}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/guide"
              className={({ isActive }) =>
                `block text-inherit no-underline hover:underline ${isActive ? 'font-bold' : ''}`
              }
            >
              Guide
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/levels"
              className={({ isActive }) =>
                `block text-inherit no-underline hover:underline ${isActive ? 'font-bold' : ''}`
              }
            >
              Level Sheet
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contest"
              className={({ isActive }) =>
                `block text-inherit no-underline hover:underline ${isActive ? 'font-bold' : ''}`
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
                  `block text-inherit no-underline hover:underline ${isActive ? 'font-bold' : ''}`
                }
              >
                Profile
              </NavLink>
            </li>
          )}
        </ul>
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="ml-4 rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="ml-4 rounded bg-pink-500 px-4 py-2 text-white hover:bg-pink-600"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}
