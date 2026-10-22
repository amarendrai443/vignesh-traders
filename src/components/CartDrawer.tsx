import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Truck,
  ArrowRight,
  User,
  Phone,
  MapPin,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponStatus(res.message);
    setTimeout(() => setCouponStatus(null), 3000);
  };

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Generate structured WhatsApp order message
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let orderText = `*VIGNESH TRADERS - ORDER INQUIRY*\n`;
    orderText += `---------------------------------\n`;
    cart.forEach((item, index) => {
      orderText += `${index + 1}. *${item.title || item.name}*\n`;
      orderText += `   Weight: ${item.selectedWeight} | Qty: ${item.quantity} | ₹${item.unitPrice * item.quantity}\n`;
    });
    orderText += `---------------------------------\n`;
    orderText += `Subtotal: ₹${subtotal}\n`;
    if (discount > 0) {
      orderText += `Discount (${couponCode || 'Promo'}): -₹${discount}\n`;
    }
    orderText += `Shipping: ${shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}\n`;
    orderText += `*Total Amount: ₹${total}*\n`;

    if (customerName.trim() || customerPhone.trim() || customerAddress.trim()) {
      orderText += `\n*Customer Details:*\n`;
      if (customerName.trim()) orderText += `• Name: ${customerName.trim()}\n`;
      if (customerPhone.trim()) orderText += `• Phone: ${customerPhone.trim()}\n`;
      if (customerAddress.trim()) orderText += `• Address: ${customerAddress.trim()}\n`;
      if (notes.trim()) orderText += `• Notes: ${notes.trim()}\n`;
    }

    orderText += `\nPlease confirm availability, payment details, and dispatch timeframe. Thank you!`;

    const encoded = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/919444810111?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#EFE9DF] text-[#2D241E] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EFE9DF] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B45309]" />
              <h2 className="font-serif font-bold text-lg text-[#2D241E]">
                Shopping Bag
              </h2>
              <span className="text-xs bg-[#FAF7F2] text-[#B45309] border border-[#EFE9DF] px-2 py-0.5 rounded-full font-mono font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-[#6E6359] hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
                  title="Empty bag"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#FAF7F2] flex items-center justify-center text-[#6E6359] hover:text-[#2D241E] transition cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#EFE9DF] text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-[#2D241E]">
                <Truck className="w-3.5 h-3.5 text-[#25D366]" />
                {amountNeededForFreeShipping === 0
                  ? 'You unlocked FREE Shipping across Andhra & Telangana!'
                  : `Add ₹${amountNeededForFreeShipping} more for FREE Shipping`}
              </span>
              <span className="font-mono text-[#B45309] font-bold">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#EFE9DF] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#25D366] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white border border-[#EFE9DF] flex items-center justify-center text-[#B45309]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-[#2D241E]">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-[#6E6359] max-w-xs">
                    Explore our handpicked California almonds, jumbo cashews, and Kashmiri walnuts to fill your bag.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedWeight}`}
                  className="p-3 bg-white rounded-xl border border-[#EFE9DF] flex gap-3 shadow-2xs"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover border border-[#EFE9DF] flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2D241E] truncate">
                          {item.title}
                        </h4>
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-[#FAF7F2] text-[#B45309] rounded border border-[#EFE9DF]">
                          {item.selectedWeight}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.selectedWeight)}
                        className="text-[#6E6359] hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#EFE9DF] rounded-md bg-[#FAF7F2]">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.selectedWeight,
                              item.quantity - 1
                            )
                          }
                          className="px-2 py-0.5 text-xs text-[#6E6359] hover:text-[#2D241E] transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-[#2D241E]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.selectedWeight,
                              item.quantity + 1
                            )
                          }
                          className="px-2 py-0.5 text-xs text-[#6E6359] hover:text-[#2D241E] transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold font-serif text-[#2D241E]">
                          ₹{item.unitPrice * item.quantity}
                        </span>
                        <span className="block text-[10px] text-[#6E6359]">
                          (₹{item.unitPrice} each)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & WhatsApp Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-[#EFE9DF] bg-white space-y-3">
              {/* Optional Quick Customer Details */}
              <div className="space-y-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE9DF]">
                <p className="text-[11px] font-bold text-[#2D241E] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Delivery Details (Included in WhatsApp text)</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-[#EFE9DF] rounded-md text-[#2D241E] placeholder:text-[#A89E92] focus:outline-none focus:border-[#B45309]"
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-[#EFE9DF] rounded-md text-[#2D241E] placeholder:text-[#A89E92] focus:outline-none focus:border-[#B45309]"
                  />
                </div>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Delivery Address / City"
                  className="w-full px-2.5 py-1 text-xs bg-white border border-[#EFE9DF] rounded-md text-[#2D241E] placeholder:text-[#A89E92] focus:outline-none focus:border-[#B45309]"
                />
              </div>

              {/* Coupon Row */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon (e.g. FESTIVE15)"
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EFE9DF] rounded-lg text-[#2D241E] uppercase placeholder:text-[#6E6359]/60 focus:outline-none focus:border-[#B45309]"
                  />
                  <Tag className="w-3.5 h-3.5 text-[#B45309] absolute right-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#2D241E] border border-[#EFE9DF] transition cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponStatus && (
                <p className="text-[11px] text-[#B45309] font-medium">{couponStatus}</p>
              )}

              {couponCode && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200">
                  <span>Coupon {couponCode} applied</span>
                  <button
                    onClick={removeCoupon}
                    className="text-[10px] text-rose-600 underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#6E6359] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#2D241E]">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span className="font-mono">- ₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-mono text-[#2D241E]">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-semibold uppercase">
                        Free
                      </span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-[#2D241E] pt-2 border-t border-[#EFE9DF]">
                  <span>Total Amount</span>
                  <span className="font-mono text-[#B45309]">₹{total}</span>
                </div>
              </div>

              {/* Direct WhatsApp Checkout Button */}
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transform active:scale-[0.99] transition cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 fill-white" />
                <span>Confirm Order via WhatsApp</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6E6359] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct merchant confirmation • No extra payment gateway fees</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
