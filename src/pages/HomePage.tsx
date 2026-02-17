import { useNavigate } from 'react-router-dom'
import discord from '@/assets/discord.jpg'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-3xl font-bold mb-6 animate-pulse">
          Welcome to Theme<span className="text-red-600">CP</span>...
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/guide')}
            className="rounded bg-pink-500 px-6 py-3 text-white font-medium hover:bg-pink-600"
          >
            Get Started
          </button>
          <button
            onClick={() => window.open('https://discord.gg/ncnut8Zw63', '_blank')}
            className="flex items-center gap-2 rounded bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700"
          >
            <img src={discord} alt="" className="w-8 h-8 rounded-full" />
            Discord
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 mb-8 rounded-lg border border-gray-200 bg-gray-50">
        <div className="text-xl font-bold mb-2">
          What is Theme<span className="text-red-600">CP</span>?
        </div>
        <p className="text-gray-700">
          ThemeCP is an experimental training system wherein users train on a perpetual ladder for
          rating ranging from 800 all the way till 3500. This system is based on two-hour, four
          problem mashups contest, ideally to be done everyday.
        </p>
      </div>

      <div className="text-xl font-bold mb-4">Why does it work?</div>
      <ul className="list-disc list-inside space-y-2 max-w-3xl">
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
  )
}
