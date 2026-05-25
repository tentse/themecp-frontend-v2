import { useEffect, useRef, useState } from 'react'

const DISCORD_URL = 'https://discord.gg/ncnut8Zw63'
const THEMECP_V1_URL = 'https://themecp.vercel.app/'

export default function WelcomeModal() {
  // Show by default on every page load/tab
  const [show, setShow] = useState(true)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!show || !dialogRef.current) return
    dialogRef.current.showModal()
    return () => {
      dialogRef.current?.close()
    }
  }, [show])

  const handleDismiss = () => {
    setShow(false)
  }

  if (!show) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[100] w-full max-w-none h-full max-h-none m-0 p-0 border-0 bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center open:p-4"
      aria-labelledby="welcome-modal-title"
      onCancel={handleDismiss}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 sm:p-8 text-slate-800">
        <h2 id="welcome-modal-title" className="text-xl font-bold text-slate-900 mb-4">
          Server under maintenance
        </h2>
        <div className="space-y-3 text-slate-700">
          <p>
            The ThemeCP v2 server is currently under work. Some features may be
            unavailable or slow to respond.
          </p>
          <p>
            In the meantime, please use{' '}
            <a
              href={THEMECP_V1_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline font-medium"
            >
              ThemeCP v1
            </a>{' '}
            to continue without interruption.
          </p>
          <p>
            Questions or issues? Reach out on our{' '}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline font-medium"
            >
              Discord
            </a>.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-3 text-white font-medium hover:bg-slate-800 active:scale-[0.99] transition-all"
        >
          Got it
        </button>
      </div>
    </dialog>
  )
}
