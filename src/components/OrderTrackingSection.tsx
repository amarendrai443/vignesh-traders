import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, AlertCircle, KeyRound, Search, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { checkRateLimit, RATE_LIMIT_POLICIES } from '../lib/rate-limiter';
import { Order, OrderStatus } from '../types';

export const OrderTrackingSection: React.FC = () => {
  const { orders } = useStore();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const rateCheck = checkRateLimit('client-otp-check', RATE_LIMIT_POLICIES.ORDER_LOOKUP);
    if (!rateCheck.success) {
      setErrorMsg(`Too many requests. Please retry in ${rateCheck.retryAfterSeconds}s.`);
      return;
    }

    const clean = mobileNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(mockOtp);
    setIsOtpSent(true);
    setOtp(mockOtp);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otp !== generatedOtp) {
      setErrorMsg('Invalid OTP. Please enter the correct 4-digit code.');
      return;
    }

    setIsVerified(true);

    const clean = mobileNumber.replace(/\D/g, '');
    const matched = orders.filter((o) => {
      const orderPhone = o.mobile_number.replace(/\D/g, '');
      return orderPhone.includes(clean) || clean.includes(orderPhone);
    });

    setUserOrders(matched);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Delivered</span>;
      case 'shipped':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">In Transit</span>;
      case 'packed':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Packed</span>;
      default:
        return <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Pending</span>;
    }
  };

  return (
    <section id="my-orders" className="py-12 bg-[#F4EFEA] border-t border-[#EFE9DF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#B45309] border border-[#EFE9DF] text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Customer Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D241E]">
            Track Order History
          </h2>
          <p className="text-xs text-[#6E6359]">
            Fetch your dry fruit shipments using only your verified 10-digit mobile number.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-[#EFE9DF] shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isVerified ? (
            <div className="max-w-md mx-auto space-y-4">
              {!isOtpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D241E] mb-1">
                      Enter Registered Mobile Number
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="e.g. 9876543210 or 9444810111"
                        className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#EFE9DF] rounded-xl text-xs text-[#2D241E] font-mono focus:border-[#C87D32] focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 bg-[#C87D32] hover:bg-[#B45309] text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6E6359]">
                    Try demo numbers: <code className="text-[#B45309] font-bold">9876543210</code> or <code className="text-[#B45309] font-bold">9822334455</code>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>OTP sent to +91 {mobileNumber}</span>
                    <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded">
                      Demo Code: {generatedOtp}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D241E] mb-1">
                      Enter 4-Digit Verification OTP
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#EFE9DF] rounded-xl text-xs text-[#2D241E] font-mono tracking-widest text-center focus:border-[#C87D32] focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Verify &amp; Fetch</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="text-[#6E6359] hover:text-[#2D241E] text-[11px] underline"
                  >
                    Change phone number
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EFE9DF]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#25D366]" />
                  <span className="text-xs font-semibold text-[#2D241E]">
                    Verified Orders for +91 {mobileNumber} ({userOrders.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsVerified(false);
                    setIsOtpSent(false);
                    setUserOrders([]);
                  }}
                  className="text-xs text-[#B45309] font-semibold hover:underline"
                >
                  Look up another number
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-8 text-[#6E6359] text-xs">
                  No orders found for this mobile number yet. Place your first order above!
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EFE9DF] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#B45309]">
                            {ord.id}
                          </span>
                          {getStatusBadge(ord.order_status)}
                          <span className="text-[#6E6359] font-mono text-[11px]">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#2D241E]">
                          {ord.items.map((i) => `${i.title} (${i.weight}) × ${i.quantity}`).join(', ')}
                        </p>
                        <p className="text-[#6E6359] text-[11px] truncate max-w-md">
                          Ship to: {ord.address}
                        </p>
                      </div>

                      <div className="text-left md:text-right flex-shrink-0">
                        <span className="text-[10px] text-[#6E6359] block">Total Amount</span>
                        <span className="font-serif font-bold text-base text-[#2D241E]">
                          ₹{ord.total_amount}
                        </span>
                        <span className="text-[10px] text-emerald-700 block capitalize font-mono font-semibold">
                          Payment: {ord.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
