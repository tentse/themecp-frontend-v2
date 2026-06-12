import { NavLink } from 'react-router-dom'

export default function ProfileTabs() {
  return (
    <div className="flex gap-2 sm:gap-3 border-b-2 border-black pb-3 mb-6 overflow-x-auto text-sm sm:text-base">
      <NavLink
        to="/profile"
        end
        className={({ isActive }) =>
          `whitespace-nowrap no-underline cursor-pointer px-2 py-0.5 rounded-[5px] transition-all duration-200 ${
            isActive ? 'bg-[lightgrey] text-black font-bold' : 'text-black hover:opacity-70'
          }`
        }
      >
        Profile
      </NavLink>
      <NavLink
        to="/profile/history"
        className={({ isActive }) =>
          `whitespace-nowrap no-underline cursor-pointer px-2 py-0.5 rounded-[5px] transition-all duration-200 ${
            isActive ? 'bg-[lightgrey] text-black font-bold' : 'text-black hover:opacity-70'
          }`
        }
      >
        Contest History
      </NavLink>
      <NavLink
        to="/profile/import-export"
        className={({ isActive }) =>
          `whitespace-nowrap no-underline cursor-pointer px-2 py-0.5 rounded-[5px] transition-all duration-200 ${
            isActive ? 'bg-[lightgrey] text-black font-bold' : 'text-black hover:opacity-70'
          }`
        }
      >
        Import/Export
      </NavLink>
    </div>
  )
}
