import { NavLink } from 'react-router-dom'

export default function ProfileTabs() {
  return (
    <div className="flex gap-4 sm:gap-6 md:gap-8 border-b border-gray-200 pb-4 mb-6 overflow-x-auto text-sm sm:text-base">
      <NavLink
        to="/profile"
        end
        className={({ isActive }) =>
          `font-medium no-underline cursor-pointer ${
            isActive ? 'text-black border-b-2 border-black' : 'text-gray-600 hover:text-gray-900'
          }`
        }
      >
        Profile
      </NavLink>
      <NavLink
        to="/profile/history"
        className={({ isActive }) =>
          `font-medium no-underline cursor-pointer ${
            isActive ? 'text-black border-b-2 border-black' : 'text-gray-600 hover:text-gray-900'
          }`
        }
      >
        Contest History
      </NavLink>
      <NavLink
        to="/profile/import-export"
        className={({ isActive }) =>
          `font-medium no-underline cursor-pointer ${
            isActive ? 'text-black border-b-2 border-black' : 'text-gray-600 hover:text-gray-900'
          }`
        }
      >
        Import/Export
      </NavLink>
    </div>
  )
}
