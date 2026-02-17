import addHandle from '@/assets/add_handle.jpg'
import contest from '@/assets/contest.jpg'
import levelSheet from '@/assets/level_sheet.jpg'
import profile from '@/assets/profile.png'
import startContest from '@/assets/start_contest.jpg'

export default function GuidePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Guide on ThemeCP</h1>
        <ol className="list-decimal list-inside space-y-6 sm:space-y-8">
          <li className="text-sm sm:text-base text-gray-700">
            Login to ThemeCP and ADD your Codeforces handle through Profile page.
            <br />
            <img src={addHandle} alt="Add handle" className="mt-2 max-w-full sm:max-w-md rounded-lg shadow-sm" />
          </li>
          <li className="text-sm sm:text-base text-gray-700">
            You can explore the level sheet page to know which contest level will suit you the best.
            It is best recommended to go with the suggested level by ThemeCP which will be shown in
            the contest page.
            <br />
            <img src={levelSheet} alt="Level sheet" className="mt-2 max-w-full sm:max-w-md rounded-lg shadow-sm" />
          </li>
          <li className="text-sm sm:text-base text-gray-700">
            Go to contest page and enter your selected level or the level suggested by ThemeCP and
            start the contest. The contest duration will be 2hr.
            <br />
            <img src={contest} alt="Contest" className="mt-2 max-w-full sm:max-w-md rounded-lg shadow-sm" />
          </li>
          <li className="text-sm sm:text-base text-gray-700">
            After submitting each problem solution press the refresh button to update your solved
            progress.
            <br />
            <img src={startContest} alt="Start contest" className="mt-2 max-w-full sm:max-w-md rounded-lg shadow-sm" />
          </li>
          <li className="text-sm sm:text-base text-gray-700">
            After the contest is over you can go to your profile page and view your performance and
            rating.
            <br />
            <img src={profile} alt="Profile" className="mt-2 max-w-full sm:max-w-md rounded-lg shadow-sm" />
          </li>
          <li className="text-sm sm:text-base text-gray-700">
            <span className="text-red-600 font-bold">NOTE</span>: YOU CAN GIVE MULTIPLE CONTEST
            WITHIN ONE DAY, BUT ONLY THE CONTEST WHERE YOUR RATING DELTA IS MAXIMUM WILL BE SHOWN ON
            THE GRAPH.
          </li>
        </ol>
      </div>
    </div>
  )
}
