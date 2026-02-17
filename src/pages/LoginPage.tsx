import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/profile')
    }
  }, [loading, isAuthenticated, navigate])

  const handleGoogleSuccess = async (response: { credential?: string }) => {
    if (!response.credential) return
    setError(null)
    try {
      const decoded = jwtDecode<{ email?: string }>(response.credential)
      const email = decoded.email
      if (!email) {
        setError('Could not get email from Google. Please try again.')
        return
      }
      await login(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
      <div className="rounded-xl bg-white p-6 sm:p-8 md:p-10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 max-w-md w-full">
        <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-bold">Sign in to ThemeCP</h2>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed. Please try again.')}
          />
        </GoogleOAuthProvider>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
      <p className="mt-6 text-center text-sm text-gray-600">
        <NavLink to="/privacy-policy" className="underline hover:no-underline">
          By creating an account or signing in you agree to our Terms and Conditions
        </NavLink>
      </p>
    </div>
  )
}
