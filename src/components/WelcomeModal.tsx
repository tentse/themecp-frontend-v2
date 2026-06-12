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
      <div className="relative w-full max-w-lg bg-white border-2 border-black rounded-[10px] p-6 sm:p-8 text-black">
        <h2 id="welcome-modal-title" className="text-xl font-bold text-black mb-4">
          Welcome to ThemeCP v2
        </h2>
        <div className="space-y-3 text-gray-700">
          <p>
            We've recently migrated data from{' '}
            <a
              href={THEMECP_V1_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-linkblue)] hover:opacity-70 underline font-bold"
            >
              ThemeCP v1
            </a>{' '}
            over to here. You may notice some inconsistencies between the data on
            v1 and v2 for now.
          </p>
          <p>
            These will be resolved soon as ThemeCP v2 becomes the official ThemeCP
            website.
          </p>
          <p>
            If you run into any problems, please reach out to me on{' '}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-linkblue)] hover:opacity-70 underline font-bold"
            >
              Discord
            </a>.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="mt-6 w-full btn-primary px-6 py-3 font-bold"
        >
          Got it
        </button>
      </div>
    </dialog>
  )
}
