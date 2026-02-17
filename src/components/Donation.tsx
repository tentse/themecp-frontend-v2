import RazorpayLogo from '@/assets/razorpay.svg'
import paypal from '@/assets/paypal.png'
import usdt from '@/assets/usdt.jpeg'
import upi from '@/assets/upi.jpeg'

export default function Donation() {
  return (
    <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
      <h3 className="mb-6 text-xl sm:text-2xl font-bold">Donate</h3>
      <div className="mb-6 space-y-2 text-gray-700">
        <p>
          Theme<span className="text-red-600">CP</span> is a non-profit platform, and while donations
          and the amount of donation are user&apos;s choice, they are greatly appreciated.
        </p>
        <p>
          The primary reason we ask for your support is to help cover the costs of hosting the
          website, which the developer personally bears. Your donation will help ensure continued
          access to the platform, enhance the user experience, and enable many more features and
          improvements.
        </p>
        <p>Thank you for your generosity and support!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <img src={RazorpayLogo} alt="Razorpay" className="h-10 sm:h-12 object-contain" />
          <button
            onClick={() => window.open('https://rzp.io/rzp/aYMLI3hg', '_blank')}
            className="mt-2 rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
          >
            Donate
          </button>
        </div>
        <div>
          <img src={paypal} alt="PayPal" className="h-10 sm:h-12 object-contain" />
          <button
            onClick={() => alert('Currently PayPal doesn\'t work. Sorry')}
            className="mt-2 rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
          >
            Donate
          </button>
        </div>
        <div>
          <img src={usdt} alt="USDT" className="h-20 sm:h-24 rounded" />
          <p className="text-sm font-medium">USDT</p>
        </div>
        <div>
          <img src={upi} alt="UPI" className="h-20 sm:h-24 rounded" />
          <p className="text-sm font-medium">UPI</p>
        </div>
      </div>
      <p className="mt-4 text-center">
        <a href="https://discord.gg/49Sva9JrmD" className="text-blue-600 underline hover:no-underline">
          Contact me @10zin
        </a>
      </p>
      <div className="mt-6">
        <p className="font-medium mb-2">Contributors</p>
        <ul className="list-disc list-inside text-sm">
          <li>SHIVANSH GUPTA</li>
          <li>IRON MAN</li>
          <li>TVN Rahul Bharadwaj</li>
          <li>Ayush Kumar</li>
        </ul>
      </div>
    </div>
  )
}
