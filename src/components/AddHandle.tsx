import { useState } from 'react'
import { getVerificationProblem, updateHandle } from '@/api/users'
import { useAuth } from '@/contexts/AuthContext'
import { buildCodeforcesUrl } from '@/utils/codeforces'

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
  const [error, setError] = useState<string | null>(null)

  const handleFindProblem = async () => {
    const handle = handleInput.trim()
    if (!handle) {
      setError('Please enter a Codeforces handle')
      return
    }
    setError(null)
    setVerificationProblem(null)
    setLoading(true)
    try {
      const problem = await getVerificationProblem(handle)
      setVerificationProblem(problem)
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
    setError(null)
    setVerifying(true)
    try {
      const result = await updateHandle(handle, verificationProblem.contestID, verificationProblem.index)
      if (result) {
        await refetchUser()
        setVerificationProblem(null)
        setHandleInput('')
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
      <div className="flex gap-2">
        <input
          type="text"
          value={handleInput}
          onChange={(e) => setHandleInput(e.target.value)}
          placeholder="Codeforces Handle..."
          disabled={verifying}
          className="flex-1 rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
        />
        <button
          onClick={handleFindProblem}
          disabled={loading}
          className="rounded bg-pink-500 px-4 py-2 text-white hover:bg-pink-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Find Problem'}
        </button>
      </div>
      {verificationProblem && (
        <div className="rounded border border-gray-200 bg-gray-50 p-4 space-y-2">
          <p className="text-sm">
            Submit a <strong>COMPILATION_ERROR</strong> to this problem on Codeforces to verify ownership, then click Verify below.
          </p>
          <a
            href={buildCodeforcesUrl(verificationProblem.contestID, verificationProblem.index)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:no-underline"
          >
            Open problem: {verificationProblem.contestID}/{verificationProblem.index} (rating: {verificationProblem.rating})
          </a>
          <div>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
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
