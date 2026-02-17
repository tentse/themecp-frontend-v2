import { useNavigate } from 'react-router-dom'
import discord from '@/assets/discord.jpg'

export default function HomePage() {
  const navigate = useNavigate()

  return (
      <div className="space-y-16">
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
        <h1 className="text-6xl sm:text-6xl md:text-6xl font-bold mb-6 sm:mb-8 text-center px-4">
          Welcome to Theme<span className="text-red-600">CP</span>
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
          <button
            onClick={() => navigate('/guide')}
            className="w-full sm:w-auto rounded-xl bg-black px-6 py-3 text-white text-base sm:text-lg font-medium hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
          >
            Get Started
          </button>
          <button
            onClick={() => window.open('https://discord.gg/ncnut8Zw63', '_blank')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white text-base sm:text-lg font-medium active:scale-95 transition-all hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: '#5865F2' }}
          >
            <img src={discord} alt="" className="w-8 h-8 rounded-full" />
            Discord
          </button>
        </div>
      </div>

      <div className="w-[90%] max-w-[90vw] mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          What is Theme<span className="text-red-600">CP</span>?
        </h2>
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
          ThemeCP is an experimental training system wherein users train on a perpetual ladder for
          rating ranging from 800 all the way till 3500. This system is based on two-hour, four
          problem mashups contest, ideally to be done everyday.
        </p>
      </div>

      <div className="w-[90%] max-w-[90vw] mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Why does it work?</h2>
        <ul className="list-disc list-inside space-y-3 sm:space-y-4 text-base sm:text-lg text-gray-700">
          <li>ThemeCP lets you train with problems in the entire difficulty range you have a shot at solving.</li>
          <li>
          This balances difficulty and skill and keeps you in the &quot;flow state&quot;, simulating your
          experience in an actual contest!
          </li>
          <li>
            Your built-in strengths and weaknesses carry a +- 200 differential on any given problem!
          Therefore, this system exposes you to problems in the entire range you could plausibly solve
          in a contest.
          </li>
          <li>
            ThemeCP&apos;s goal is to increase your chances of solving such &quot;feasible&quot; problems in-contest
          and to increase your speed in solving such problems.
          </li>
          <li>
            Furthermore, ThemeCP&apos;s high success rate, self-balancing at around 50%, keeps your motivation
          high. Failures increase your success rate (literally), and successes prove your improvement!
          </li>
        </ul>
      </div>
    </div>
  )
}
