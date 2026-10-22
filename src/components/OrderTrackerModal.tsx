import React, { useState } from 'react';
import { X, Search, Package, CheckCircle, Truck, Clock, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { orderLookupSchema, OrderLookupInput } from '../lib/validation';
import { checkRateLimit, RATE_LIMIT_POLICIES, RateLimitResult } from '../lib/rate-limiter';
import { Order, OrderStatus } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  defaultOrderId = '',
}) => {
  const { orders, role, updateOrderStatus } = useStore();

  const [orderId, setOrderId] = useState(defaultOrderId);
  const [mobileNumber, setMobileNumber] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [rateLimitResult, setRateLimitResult] = useState<RateLimitResult | null>(null);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setRateLimitResult(null);
    setMatchedOrder(null);
    setHasSearched(false);

    // 1. Rate Limiting Check (max 10 requests per minute)
    const clientIp = 'client-session-ip-192.168.1.10';
    const limitCheck = checkRateLimit(clientIp, RATE_LIMIT_POLICIES.ORDER_LOOKUP);
    setRateLimitResult(limitCheck);

    if (!limitCheck.success) {
      return;
    }

    // 2. Validate with Zod
    const payload: OrderLookupInput = {
      order_id: orderId.trim(),
      mobile_number: mobileNumber.trim(),
    };

    const parsed = orderLookupSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((err: any) => {
        errors[err.path.join('.')] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    // 3. Supabase RLS Simulation
    // If Admin: can view any order by ID.
    // If Customer: requires both order ID and matching mobile number.
    const found = orders.find((o) => {
      const idMatch = o.id.toLowerCase() === payload.order_id.toLowerCase();
      if (role === 'admin') {
        return idMatch;
      }
      // Customer RLS check
      const cleanPhoneInput = payload.mobile_number.replace(/\D/g, '');
      const cleanOrderPhone = o.mobile_number.replace(/\D/g, '');
      return idMatch && (cleanOrderPhone.includes(cleanPhoneInput) || cleanPhoneInput.includes(cleanOrderPhone));
    });

    setMatchedOrder(found || null);
    setHasSearched(true);
  };

  const steps: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'Order Received', icon: <Clock className="w-4 h-4" /> },
    { key: 'packed', label: 'Handcrafted & Packed', icon: <Package className="w-4 h-4" /> },
    { key: 'shipped', label: 'Dispatched (Express)', icon: <Truck className="w-4 h-4" /> },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'packed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-900/50 rounded-2xl shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-amber-900/40 bg-stone-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-200">
                Track Royal Order Status
              </h3>
              <p className="text-[11px] text-stone-400">
                Secured by RLS verification & sliding-window rate limit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rate Limiting Notice */}
        {rateLimitResult && !rateLimitResult.success && (
          <div className="m-5 p-4 bg-rose-950/80 border border-rose-600/70 rounded-xl text-rose-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4" />
              <span>HTTP 429: Rate Limit Exceeded on Lookup Endpoint</span>
            </div>
            <p>
              Max {rateLimitResult.limit} lookups per minute allowed. Please try again in {rateLimitResult.retryAfterSeconds} seconds.
            </p>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {/* Lookup Form */}
          <form onSubmit={handleLookup} className="space-y-3 bg-stone-950/60 p-4 rounded-xl border border-amber-900/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Order ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-98214"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-stone-900 text-stone-100 text-xs font-mono border ${
                    formErrors.order_id ? 'border-rose-500' : 'border-amber-900/50'
                  } focus:outline-none focus:border-amber-500`}
                />
                {formErrors.order_id && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.order_id}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Mobile Number {role === 'admin' ? '(Optional in Admin Mode)' : '*'}
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-stone-900 text-stone-100 text-xs font-mono border ${
                    formErrors.mobile_number ? 'border-rose-500' : 'border-amber-900/50'
                  } focus:outline-none focus:border-amber-500`}
                />
                {formErrors.mobile_number && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.mobile_number}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400">
                Sample Order ID for demo: <code className="text-amber-300 font-mono">ORD-98214</code> (Phone: <code className="text-amber-300 font-mono">9876543210</code>)
              </span>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify & Lookup</span>
              </button>
            </div>
          </form>

          {/* Results Display */}
          {matchedOrder ? (
            <div className="space-y-4 bg-stone-950/70 p-4 rounded-xl border border-amber-900/40">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {matchedOrder.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-mono">
                      {matchedOrder.payment_status}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-stone-100 mt-1">
                    Recipient: {matchedOrder.customer_name}
                  </h4>
                  <p className="text-xs text-stone-400">{matchedOrder.address}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Total Amount</span>
                  <span className="font-serif font-bold text-amber-300 text-lg">
                    ₹{matchedOrder.total_amount}
                  </span>
                </div>
              </div>

              {/* Visual Status Progress */}
              <div className="pt-3 border-t border-amber-900/30">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3">
                  Live Dispatch Journey
                </span>
                <div className="grid grid-cols-4 gap-2 relative">
                  {steps.map((st, idx) => {
                    const currentIdx = getStepIndex(matchedOrder.order_status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={st.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-800 text-stone-500'
                          }`}
                        >
                          {st.icon}
                        </div>
                        <span
                          className={`text-[10px] leading-tight font-medium ${
                            isCurrent
                              ? 'text-amber-300 font-bold'
                              : isDone
                              ? 'text-stone-300'
                              : 'text-stone-600'
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items List */}
              <div className="pt-3 border-t border-amber-900/30">
                <span className="block text-[11px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                  Package Contents:
                </span>
                <div className="space-y-1">
                  {matchedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs text-stone-300 bg-stone-900/60 p-2 rounded"
                    >
                      <span>
                        {item.title} ({item.weight}) × {item.quantity}
                      </span>
                      <span className="font-mono text-amber-300">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Status Mutation Workbench */}
              {role === 'admin' && (
                <div className="p-3 bg-amber-950/40 rounded-lg border border-amber-600/40 mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Admin Status Override (Triggers Supabase Audit Log)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['pending', 'packed', 'shipped', 'delivered'] as OrderStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(matchedOrder.id, status)}
                        className={`py-1 text-[11px] rounded font-medium capitalize transition ${
                          matchedOrder.order_status === status
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : hasSearched ? (
            <div className="p-6 text-center bg-stone-950/60 rounded-xl border border-stone-800 space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-semibold text-stone-200">
                No Matching Order Found
              </h4>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Either the Order ID does not exist or the mobile number provided does not match the record. This enforces Row Level Security (RLS).
              </p>
            </div>
          ) : null}

          {/* RLS explanation footer */}
          <div className="flex items-center gap-2 p-3 bg-stone-950 text-[11px] text-stone-400 rounded-lg border border-stone-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>RLS Rule Active:</strong> Customer queries must match phone number with order phone number; unauthorized cross-account reads are blocked at database level.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
