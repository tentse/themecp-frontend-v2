import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Leaderboard from '@/components/Leaderboard'
import Donation from '@/components/Donation'

// The contest flow needs full width and no distraction; login and the privacy
// policy are single-purpose pages where a leaderboard rail would just be noise.
const HIDE_SIDEBAR_PATHS = ['/contest', '/contest/start', '/login', '/privacy-policy']

export default function Layout() {
  const { pathname } = useLocation()
  const showSidebar = !HIDE_SIDEBAR_PATHS.includes(pathname)
  const isProfileRoute = pathname === '/profile' || pathname.startsWith('/profile/')

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="w-[95%] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex-1">
        {showSidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="lg:col-span-3 min-w-0">
              <Outlet />
            </div>
            {/* Stacks below the content on mobile, sticky rail on desktop. */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="lg:sticky lg:top-6 space-y-6">
                <Leaderboard />
                {isProfileRoute && <Donation />}
              </div>
            </aside>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
    </div>
  )
}
