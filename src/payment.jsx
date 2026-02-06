import { FaCreditCard, FaLock } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const { theme } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  // Get plan from navigation state, OR fallback
  const plan = location.state?.plan;

  // Fallback defaults if accessed directly or for booking
  const title = plan ? `Subscription: ${plan.name}` : "Expert Session Booking";
  const price = plan ? plan.price : 499;
  const description = plan
    ? `Generic secure payment for ${plan.duration_days} days access`
    : "Secure payment powered by your platform";

  const bg = isDark ? "bg-neutral-900 text-white" : "bg-gray-50 text-black";
  const card = isDark ? "bg-neutral-800" : "bg-white";
  const border = isDark ? "border-neutral-700" : "border-neutral-300";
  const input = isDark
    ? "bg-neutral-700 text-white placeholder-neutral-400"
    : "bg-gray-100 text-black placeholder-gray-500";

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bg}`}>
      <div className={`w-full max-w-lg rounded-2xl shadow-xl border ${border} ${card} p-6`}>

        {/* HEADER */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Complete Your Payment</h1>
          <p className="text-sm opacity-70 mt-1">
            {description}
          </p>
        </div>

        {/* PLAN SUMMARY */}
        <div className={`mb-6 p-4 rounded-xl border ${border}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-70">Selected Plan</p>
              <p className="font-semibold">{title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-70">Amount</p>
              <p className="text-lg font-bold text-green-500">₹{price}</p>
            </div>
          </div>
        </div>

        {/* PAYMENT FORM */}
        <div className="space-y-4">

          {/* CARD NUMBER */}
          <div>
            <label className="text-sm font-medium">Card Number</label>
            <div className={`mt-1 flex items-center gap-2 px-3 py-2 rounded-lg border ${border} ${input}`}>
              <FaCreditCard className="opacity-60" />
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* EXPIRY & CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Expiry</label>
              <input
                type="text"
                placeholder="MM / YY"
                className={`mt-1 w-full px-3 py-2 rounded-lg border ${border} ${input} outline-none`}
              />
            </div>
            <div>
              <label className="text-sm font-medium">CVV</label>
              <input
                type="password"
                placeholder="***"
                className={`mt-1 w-full px-3 py-2 rounded-lg border ${border} ${input} outline-none`}
              />
            </div>
          </div>

          {/* NAME */}
          <div>
            <label className="text-sm font-medium">Card Holder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className={`mt-1 w-full px-3 py-2 rounded-lg border ${border} ${input} outline-none`}
            />
          </div>
        </div>

        {/* PAY BUTTON */}
        <button
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     bg-red-600 text-white font-semibold hover:bg-red-700 transition
                     whitespace-nowrap"
          onClick={() => {
            alert("Payment successful (Mock)!");
            navigate(-1);
          }}
        >
          <FaLock />
          Pay ₹{price} Securely
        </button>

        {/* FOOTER */}
        <p className="mt-4 text-xs text-center opacity-60">
          Your payment is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
