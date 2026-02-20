import { useEffect, useState } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { Auth0Provider } from '@auth0/auth0-react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LevelProvider } from '@/contexts/LevelContext'
import Layout from '@/components/layout/Layout'
import ProfileLayout from '@/components/layout/ProfileLayout'

// Pages - will be implemented in subsequent steps
import HomePage from '@/pages/HomePage'
import GuidePage from '@/pages/GuidePage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import LoginPage from '@/pages/LoginPage'
import LevelsPage from '@/pages/LevelsPage'
import ContestPage from '@/pages/ContestPage'
import ContestStartPage from '@/pages/ContestStartPage'
import ProfilePage from '@/pages/ProfilePage'
import ContestHistoryPage from '@/pages/ContestHistoryPage'
import ImportExportPage from '@/pages/ImportExportPage'
import Auth0DemoPage from '@/pages/Auth0DemoPage'

function PageViewTracker() {
  const location = useLocation()
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA4_ID
    if (gaId) {
      ReactGA.initialize(gaId)
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search, title: document.title })
    }
  }, [location])
  return null
}

function PrivateRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { token, user, isAuthenticated, loading, error, clearError, refetchUser } = useAuth()
  const [retrying, setRetrying] = useState(false)
  if (loading) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
    </div>
  )

  // No token at all -> must login.
  if (!token) return <Navigate to="/login" replace />

  // Token exists but user couldn't be loaded (network/backend/CORS etc.) -> don't bounce to login.
  if (!user && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
        <p className="text-red-600 font-medium">
          {error ?? 'Unable to load your profile right now. Please try again.'}
        </p>
        <button
          onClick={async () => {
            if (retrying) return
            setRetrying(true)
            try {
              clearError()
              await refetchUser()
            } finally {
              setRetrying(false)
            }
          }}
          className="mt-4 rounded-xl bg-black px-6 py-2 text-white hover:bg-gray-800 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={retrying}
        >
          {retrying ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    )
  }

  return <>{children}</>
}

function AppContent() {
  return (
    <LevelProvider>
      <PageViewTracker />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/levels" element={<LevelsPage />} />
          <Route path="/contest" element={<PrivateRoute><ContestPage /></PrivateRoute>} />
          <Route path="/contest/start" element={<PrivateRoute><ContestStartPage /></PrivateRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<PrivateRoute><ProfileLayout /></PrivateRoute>}>
            <Route index element={<ProfilePage />} />
            <Route path="history" element={<ContestHistoryPage />} />
            <Route path="import-export" element={<ImportExportPage />} />
          </Route>
        </Route>
        {/* Auth0 Demo Page - standalone route without Layout */}
        <Route path="/auth0-demo" element={<Auth0DemoPage />} />
      </Routes>
    </LevelProvider>
  )
}

export default function App() {
  const authorizationParams: { redirect_uri: string; audience?: string } = {
    redirect_uri: `${globalThis.location.origin}/login`,
  }
  
  // Only include audience if it's defined and not a placeholder
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE
  if (audience && !audience.includes('your-api-identifier')) {
    authorizationParams.audience = audience
  }

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN || ''}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || ''}
      authorizationParams={authorizationParams}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Auth0Provider>
  )
}
