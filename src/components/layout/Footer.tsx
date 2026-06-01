import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import discord from '@/assets/discord.jpg'

// Direct image URLs — no fetch(), no CORS issues
// Each is called with a cache-busting param to get a fresh cat every time
const CAT_SOURCES = [
  (r: number) => `https://cataas.com/cat?${r}`,
  (r: number) => `https://loremflickr.com/400/300/cat?random=${r}`,
  (r: number) => `https://placekitten.com/${380 + (r % 40)}/${280 + (r % 40)}`,
]

const APP_VERSION = '2.0.0'

// Add new contributors here — they'll automatically appear in the footer
const CONTRIBUTORS: { name: string; github: string }[] = [
  { name: 'Tenzin Tsering', github: 'https://github.com/tentse' },
  { name: 'Devaj Rathore', github: 'https://github.com/mesonicDEVAJ18' },
]

export default function Footer() {
  const [catVisible, setCatVisible] = useState(false)
  const [catUrl, setCatUrl] = useState('')
  const [catLoading, setCatLoading] = useState(false)
  const [catImgReady, setCatImgReady] = useState(false)
  const [catFailed, setCatFailed] = useState(false)
  const sourceIdxRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCatTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const trySource = (idx: number) => {
    const r = Math.floor(Math.random() * 9999)
    const fn = CAT_SOURCES[idx]
    if (!fn) {
      // all sources exhausted
      setCatLoading(false)
      setCatFailed(true)
      return
    }
    sourceIdxRef.current = idx
    setCatUrl(fn(r))
    // safety timeout — if image hasn't fired onLoad within 8s, move to next source
    clearCatTimeout()
    timeoutRef.current = setTimeout(() => {
      trySource(idx + 1)
    }, 8000)
  }

  const showCat = () => {
    if (catLoading && !catFailed) return
    setCatVisible(true)
    setCatImgReady(false)
    setCatFailed(false)
    setCatUrl('')
    setCatLoading(true)
    sourceIdxRef.current = 0
    trySource(0)
  }

  const hideCat = () => {
    clearCatTimeout()
    setCatVisible(false)
    setCatUrl('')
    setCatImgReady(false)
    setCatFailed(false)
    setCatLoading(false)
  }

  return (
    <>
      {/* Cat Easter Egg Modal */}
      {catVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={hideCat}
        >
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl max-w-sm w-[90%] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#111] px-4 py-3 flex items-center justify-between">
              <span className="text-white font-semibold text-sm tracking-wide">🐱 Random Cat</span>
              <button
                onClick={hideCat}
                className="text-gray-400 hover:text-white transition-colors text-xl leading-none cursor-pointer"
                aria-label="Close cat"
              >
                ×
              </button>
            </div>
            {/* spinner: loading but image not ready yet */}
            {catLoading && !catFailed && (
              <div className="h-64 flex flex-col items-center justify-center gap-3 bg-[#1a1a1a]">
                <svg className="animate-spin w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-gray-500 text-xs">Fetching cat…</span>
              </div>
            )}
            {/* all sources failed */}
            {catFailed && (
              <div className="h-64 flex flex-col items-center justify-center gap-3 bg-[#1a1a1a]">
                <span className="text-3xl">😿</span>
                <span className="text-gray-400 text-sm">No cat found. Try again?</span>
                <button
                  onClick={showCat}
                  className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-1.5 text-xs text-white transition-all cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}
            {catUrl && !catFailed && (
              <img
                src={catUrl}
                alt="A random cat"
                className={`w-full h-64 object-cover transition-opacity duration-300 ${catImgReady ? 'opacity-100' : 'opacity-0 h-0'}`}
                onLoad={() => { clearCatTimeout(); setCatImgReady(true); setCatLoading(false) }}
                onError={() => { clearCatTimeout(); trySource(sourceIdxRef.current + 1) }}
              />
            )}
            <div className="bg-[#111] px-4 py-2 text-center text-gray-500 text-xs">
              Click outside to close
            </div>
          </div>
        </div>
      )}

      <footer className="bg-black text-white mt-auto">
        {/* Main footer content */}
        <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

            {/* Brand column */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold tracking-tight">
                Theme<span className="text-red-500">CP</span>{' '}
                <span className="text-gray-500 text-sm font-normal">v{APP_VERSION}</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                An experimental competitive programming training system built on a perpetual rating ladder.
              </p>
              {/* Social buttons */}
              <div className="flex flex-wrap gap-2 mt-1">
                <a
                  href="https://github.com/tentse/themecp-frontend-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all px-4 py-2 text-sm text-white font-medium cursor-pointer"
                  aria-label="GitHub"
                >
                  {/* GitHub icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.42 7.88 10.95.58.1.79-.25.79-.56v-2.07c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.18-1.48 3.14-1.17 3.14-1.17.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.13v3.17c0 .31.2.67.8.56C20.21 21.41 23.5 17.1 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://discord.gg/ncnut8Zw63"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl active:scale-95 transition-all px-4 py-2 text-sm text-white font-medium cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: '#5865F2' }}
                  aria-label="Discord"
                >
                  <img src={discord} alt="" className="w-4 h-4 rounded-full" />
                  Discord
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                Quick Links
              </h3>
              <ul className="flex flex-col gap-2">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Guide', to: '/guide' },
                  { label: 'Level Sheet', to: '/levels' },
                  { label: 'Contest', to: '/contest' },
                  { label: 'Login', to: '/login' },
                  { label: 'Privacy Policy', to: '/privacy-policy' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* External Resources */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                Resources
              </h3>
              <ul className="flex flex-col gap-2">
                {[
                  { label: 'Codeforces', href: 'https://codeforces.com' },
                  { label: 'Polygon', href: 'https://polygon.codeforces.com' },
                  { label: 'CF Problemset', href: 'https://codeforces.com/problemset' },
                  { label: 'CP-Algorithms', href: 'https://cp-algorithms.com' },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Credits */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                Credits
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Built with ❤️ by{' '}
                <a
                  href="https://github.com/tentse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-200 underline underline-offset-2 transition-colors"
                >
                  tentse
                </a>{' '}
                and all contributors.
              </p>
              {/* Contributors list */}
              <ul className="flex flex-col gap-2">
                {CONTRIBUTORS.map((c, i) => {
                  const username = c.github.replace('https://github.com/', '')
                  const avatarUrl = `https://github.com/${username}.png?size=48`
                  const isFirst = i === 0
                  return (
                    <li key={c.github}>
                      <a
                        href={c.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-colors inline-flex items-center gap-2 group ${isFirst ? 'text-gray-300 hover:text-white text-xs' : 'text-gray-500 hover:text-gray-300 text-[10px]'}`}
                      >
                        <img
                          src={avatarUrl}
                          alt={c.name}
                          className={`rounded-full object-cover ring-1 ring-white/10 group-hover:ring-white/30 transition-all shrink-0 ${isFirst ? 'w-8 h-8' : 'w-5 h-5'}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        {c.name}
                      </a>
                    </li>
                  )
                })}
              </ul>

              <p className="text-gray-500 text-xs leading-relaxed">
                Special thanks to{' '}
                <a
                  href="https://codeforces.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  MikeMirzayanov
                </a>{' '}
                &amp;{' '}
                <a
                  href="https://codeforces.com/blog/entry/99287"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  KAN
                </a>{' '}
                for Codeforces &amp; Polygon, and to every contributor and user of ThemeCP.
              </p>
              {/* Cat easter egg */}
              <button
                onClick={showCat}
                disabled={catLoading}
                className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all px-3 py-1.5 text-xs text-gray-400 hover:text-white w-fit cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cat easter egg"
              >
                🐱 pspsps…
              </button>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} ThemeCP. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs italic">
              Thanks for using Theme<span className="text-red-700">CP</span> 🎉
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
