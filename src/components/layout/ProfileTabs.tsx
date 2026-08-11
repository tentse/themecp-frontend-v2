import { NavLink } from 'react-router-dom'

interface ProfileTabsProps {
  /** undefined when viewing your own profile at /profile */
  viewedUserId?: string
  isOwnProfile: boolean
}

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap no-underline cursor-pointer px-2 py-0.5 rounded-[5px] transition-all duration-200 ${
    isActive ? 'bg-[lightgrey] text-black font-bold' : 'text-black hover:opacity-70'
  }`

export default function ProfileTabs({ viewedUserId, isOwnProfile }: Readonly<ProfileTabsProps>) {
  const base = viewedUserId ? `/profile/${viewedUserId}` : '/profile'

  return (
    <div className="flex gap-2 sm:gap-3 border-b-2 border-black pb-3 mb-6 overflow-x-auto text-sm sm:text-base">
      <NavLink to={base} end className={tabClass}>
        Profile
      </NavLink>
      <NavLink to={`${base}/history`} className={tabClass}>
        Contest History
      </NavLink>
      {/* Import/Export only ever acts on your own data. */}
      {isOwnProfile && !viewedUserId && (
        <NavLink to="/profile/import-export" className={tabClass}>
          Import/Export
        </NavLink>
      )}
    </div>
  )
}
