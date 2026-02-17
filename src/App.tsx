import { useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
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
import ProfilePage from '@/pages/ProfilePage'
import ContestHistoryPage from '@/pages/ContestHistoryPage'
import ImportExportPage from '@/pages/ImportExportPage'

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

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Loading...</div>
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
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
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<PrivateRoute><ProfileLayout /></PrivateRoute>}>
            <Route index element={<ProfilePage />} />
            <Route path="history" element={<ContestHistoryPage />} />
            <Route path="import-export" element={<ImportExportPage />} />
          </Route>
        </Route>
      </Routes>
    </LevelProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
