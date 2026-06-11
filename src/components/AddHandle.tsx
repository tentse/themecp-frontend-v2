import { useCallback, useEffect, useState } from 'react'
import { getVerificationProblem, updateHandle } from '@/api/users'
import { useAuth } from '@/contexts/AuthContext'
import { buildCodeforcesUrl } from '@/utils/codeforces'
import CountdownTimer from '@/components/CountdownTimer'

export default function AddHandle() {
  const { refetchUser } = useAuth()
  const [handleInput, setHandleInput] = useState('')
  const [verificationProblem, setVerificationProblem] = useState<{
    contestID: string
    index: string
    rating: number
    tags: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!expiresAtMs) return
    setNowMs(Date.now())
    const id = setInterval(() => setNowMs(Date.now()), 250)
    return () => clearInterval(id)
  }, [expiresAtMs])

  const isExpired = !!expiresAtMs && nowMs >= expiresAtMs

  const handleTimeout = useCallback(() => {
    setError('Time over. Please find a new verification problem.')
    setVerificationProblem(null)
    setHandleInput('')
    setVerifying(false)
    setExpiresAtMs(null)
  }, [])

  const handleFindProblem = async () => {
    const handle = handleInput.trim()
    if (!handle) {
      setError('Please enter a Codeforces handle')
      return
    }
    setError(null)
    setVerificationProblem(null)
    setExpiresAtMs(null)
    setLoading(true)
    try {
      const problem = await getVerificationProblem(handle)
      setVerificationProblem(problem)
      setExpiresAtMs(Date.now() + 60_000)
    } catch (err: unknown) {
      const detail = err && typeof err === 'object' && 'detail' in err ? String((err as { detail: string }).detail) : 'Failed to get verification problem'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    const handle = handleInput.trim()
    if (!handle || !verificationProblem) return
    if (!expiresAtMs || Date.now() >= expiresAtMs) {
      handleTimeout()
      return
    }
    setError(null)
    setVerifying(true)
    try {
      const result = await updateHandle(handle, verificationProblem.contestID, verificationProblem.index)
      if (result) {
        await refetchUser()
        setVerificationProblem(null)
        setHandleInput('')
        setExpiresAtMs(null)
      } else {
        setError('Verification failed. Please submit a COMPILATION_ERROR to the problem on Codeforces, then try again.')
      }
    } catch (err: unknown) {
      const detail = err && typeof err === 'object' && 'detail' in err ? String((err as { detail: string }).detail) : 'Verification failed'
      setError(detail)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="font-medium">Add your Codeforces handle:</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={handleInput}
          onChange={(e) => setHandleInput(e.target.value)}
          placeholder="Codeforces Handle..."
          disabled={verifying}
          className="flex-1 nb-input px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleFindProblem}
          disabled={loading}
          className="w-full sm:w-auto btn-press rounded-[10px] bg-black px-5 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Loading...' : 'Get Problem'}
        </button>
      </div>
      {verificationProblem && (
        <div className="rounded-[10px] border-2 border-black bg-gray-50 p-6 space-y-4">
          <p className="text-sm">
            Submit a <strong>COMPILATION_ERROR</strong> to this problem on Codeforces to verify ownership, then click Verify below.
          </p>
          {expiresAtMs && (
            <div className="text-sm text-gray-700">
              Time left: <CountdownTimer targetTimestamp={expiresAtMs} onExpire={handleTimeout} className="font-mono" />
            </div>
          )}
          <a
            href={buildCodeforcesUrl(verificationProblem.contestID, verificationProblem.index)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-linkblue)] underline hover:no-underline"
          >
            Open problem: {verificationProblem.contestID}/{verificationProblem.index} (rating: {verificationProblem.rating})
          </a>
          <div>
            <button
              onClick={handleVerify}
              disabled={verifying || isExpired}
              className="w-full sm:w-auto rounded-[10px] bg-green-600 px-5 py-3 text-white hover:opacity-80 active:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-150 cursor-pointer"
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
