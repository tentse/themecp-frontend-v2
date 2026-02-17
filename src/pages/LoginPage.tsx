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
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold">Sign in to ThemeCP</h2>
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
