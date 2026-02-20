export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Privacy Policy</h1>
      <ul className="list-disc list-inside space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
        <li>We use Google login to sign in users.</li>
        <li>We only use your data to create a user session for our webpage and not for any other purposes.</li>
        <li>By logging in through Google you agree to share your personal data.</li>
      </ul>
    </div>
  )
}
