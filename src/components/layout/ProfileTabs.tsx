import { NavLink } from 'react-router-dom'

export default function ProfileTabs() {
  return (
    <div className="flex gap-6 border-b border-gray-300 pb-2 mb-4">
      <NavLink
        to="/profile"
        end
        className={({ isActive }) =>
          `font-medium no-underline ${
            isActive ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-600 hover:text-gray-900'
          }`
        }
      >
        Profile
      </NavLink>
      <NavLink
        to="/profile/history"
        className={({ isActive }) =>
          `font-medium no-underline ${
            isActive ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-600 hover:text-gray-900'
          }`
        }
      >
        Contest History
      </NavLink>
      <NavLink
        to="/profile/import-export"
        className={({ isActive }) =>
          `font-medium no-underline ${
            isActive ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-600 hover:text-gray-900'
          }`
        }
      >
        Import/Export
      </NavLink>
    </div>
  )
}
