import { Outlet } from 'react-router-dom'
import ProfileTabs from './ProfileTabs'

export default function ProfileLayout() {
  return (
    <div>
      <ProfileTabs />
      <Outlet />
    </div>
  )
}
