import { useEffect, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getProfile } from '@/api/users'
import type { UserResponse } from '@/api/types'
import type { ProfileView } from '@/hooks/useProfileView'
import ProfileTabs from './ProfileTabs'

function getErrorStatus(error: unknown): number | null {
  return error && typeof error === 'object' && 'status' in error && typeof (error as { status: unknown }).status === 'number'
    ? (error as { status: number }).status
    : null
}

export default function ProfileLayout() {
  const { userId } = useParams<{ userId?: string }>()
  const { user: authUser } = useAuth()
  const [fetchedUser, setFetchedUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(!!userId)
  const [notFound, setNotFound] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    // No :userId means the private /profile route — AuthContext already holds the
    // profile (with the email), so there is nothing to fetch and behaviour is
    // byte-for-byte what it was before public profiles existed.
    if (!userId) {
      setFetchedUser(null)
      setLoading(false)
      setNotFound(false)
      setFailed(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setFailed(false)
    // Always send user_id. With it present these endpoints never 401, which is what
    // keeps a logged-out visitor from being bounced to /login by handleResponse.
    getProfile(userId)
      .then((profile) => {
        if (!cancelled) setFetchedUser(profile)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setFetchedUser(null)
        if (getErrorStatus(error) === 404) setNotFound(true)
        else setFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [userId])

  const profileUser = userId ? fetchedUser : authUser
  const isOwnProfile = !userId || authUser?.id === userId

  const context: ProfileView = { profileUser, viewedUserId: userId, isOwnProfile }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-4 sm:p-6 md:p-8 nb-card">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">User not found</h2>
        <p className="text-gray-700">No user exists with the id <span className="font-mono">{userId}</span>.</p>
      </div>
    )
  }

  if (failed) {
    return (
      <div className="p-4 sm:p-6 md:p-8 nb-card">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Could not load profile</h2>
        <p className="text-gray-700">Something went wrong fetching this profile. Please try again.</p>
      </div>
    )
  }

  return (
    <div>
      <ProfileTabs viewedUserId={userId} isOwnProfile={isOwnProfile} />
      <Outlet context={context} />
    </div>
  )
}
