import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginWithRedirect, isAuthenticated: auth0Authenticated, isLoading: auth0Loading, error: auth0Error } = useAuth0()
  const { isAuthenticated, loading, error: backendError, clearError } = useAuth()

  // Debug logging
  useEffect(() => {
    console.log('=== LoginPage Debug Info ===')
    console.log('Auth0 Domain:', import.meta.env.VITE_AUTH0_DOMAIN)
    console.log('Auth0 Client ID:', import.meta.env.VITE_AUTH0_CLIENT_ID)
    console.log('Auth0 Loading:', auth0Loading)
    console.log('Auth0 Authenticated:', auth0Authenticated)
    console.log('Backend Loading:', loading)
    console.log('Backend Authenticated:', isAuthenticated)
    console.log('Auth0 Error:', auth0Error)
  }, [auth0Loading, auth0Authenticated, loading, isAuthenticated, auth0Error])

  useEffect(() => {
    if (!loading && !auth0Loading && isAuthenticated && auth0Authenticated) {
      console.log('Redirecting to /profile')
      navigate('/profile')
    }
  }, [loading, auth0Loading, isAuthenticated, auth0Authenticated, navigate])

  const handleLogin = async () => {
    console.log('Login button clicked')
    clearError()
    try {
      await loginWithRedirect()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  if (loading || auth0Loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
      <div className="rounded-xl bg-white p-6 sm:p-8 md:p-10 shadow-sm max-w-md w-full">
        <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-bold">Sign in to ThemeCP</h2>
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Sign In with Auth0
        </button>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Sign in with Google, GitHub, or other providers
        </p>
        {auth0Error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {auth0Error.message}
          </div>
        )}
        {backendError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {backendError}
          </div>
        )}
      </div>
      <p className="mt-6 text-center text-sm text-gray-600">
        <NavLink to="/privacy-policy" className="underline hover:no-underline cursor-pointer">
          By creating an account or signing in you agree to our Terms and Conditions
        </NavLink>
      </p>
    </div>
  )
}
