import { useOutletContext } from 'react-router-dom'
import type { UserResponse } from '@/api/types'

/**
 * Resolved once by ProfileLayout and shared with every profile sub-page, so they
 * all agree on whose profile is being viewed without refetching it.
 */
export interface ProfileView {
  profileUser: UserResponse | null
  /**
   * undefined when viewing your own profile — pass it straight through to the API
   * functions, which omit `user_id` entirely when it is undefined.
   */
  viewedUserId?: string
  /** Gates own-only UI (email row is server-driven, not gated on this). */
  isOwnProfile: boolean
}

export function useProfileView(): ProfileView {
  return useOutletContext<ProfileView>()
}
