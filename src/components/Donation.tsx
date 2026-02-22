import RazorpayLogo from '@/assets/razorpay.svg'
import paypal from '@/assets/paypal.png'
import usdt from '@/assets/usdt.jpeg'
import upi from '@/assets/upi.jpeg'

export default function Donation() {
  return (
    <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white shadow-sm">
      <h3 className="mb-6 text-xl sm:text-2xl font-bold">Donate</h3>
      <div className="mb-6 space-y-2 text-gray-700 font-bold">
        <p>
          Theme<span className="text-red-600">CP</span> is a non-profit platform, and while donations
          and the amount of donation are user&apos;s choice, they are greatly appreciated.
        </p>
        <p>
        The main reason we ask for your support is to help cover the hosting costs, which the developer currently pays personally. Your donation helps keep ThemeCP running, improve the experience, and add new features. If you’d like to show extra appreciation, you can also treat it as a tip to support continued development.
        </p>
        <p>Thank you for your generosity and support!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col items-center">
          <img src={usdt} alt="USDT" className="h-36 sm:h-44 md:h-52 rounded" />
          <p className="text-sm font-medium mt-2 text-center">USDT</p>
        </div>
        <div className="flex flex-col items-center">
          <img src={upi} alt="UPI" className="h-36 sm:h-44 md:h-52 rounded" />
          <p className="text-sm font-medium mt-2 text-center">UPI</p>
        </div>
      </div>
      <p className="mt-4 text-center">
        <a href="https://discord.gg/49Sva9JrmD" className="text-blue-600 underline hover:no-underline">
          Contact me @10zin
        </a>
      </p>
    </div>
  )
}
