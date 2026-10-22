import React, { useState } from 'react';
import { Tag, Sparkles, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

export const BannerSection: React.FC = () => {
  const { banners, role, toggleBannerStatus } = useStore();
  const { applyCoupon } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeBanners = role === 'admin' ? banners : banners.filter((b) => b.active);

  const handleCopyCoupon = (code: string) => {
    applyCoupon(code);
    setCopiedCode(code);
    navigator.clipboard?.writeText(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (activeBanners.length === 0) return null;

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeBanners.map((banner) => (
            <div
              key={banner.id}
              className={`relative overflow-hidden rounded-2xl border transition-all shadow-md group ${
                banner.active
                  ? 'border-amber-900/40 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/60'
                  : 'border-stone-800 bg-stone-900/60 opacity-60'
              }`}
            >
              <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-35 transition duration-700">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                />
              </div>

              <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full min-h-[140px]">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Limited Royal Offer
                    </span>
                    <h3 className="text-stone-100 font-serif font-bold text-base sm:text-lg tracking-wide max-w-sm">
                      {banner.title}
                    </h3>
                  </div>

                  {/* Admin toggle control */}
                  {role === 'admin' && (
                    <button
                      onClick={() => toggleBannerStatus(banner.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-stone-950/80 border border-amber-600/50 text-[11px] text-amber-300 hover:bg-stone-900"
                      title="Toggle banner active state (RLS simulated trigger)"
                    >
                      {banner.active ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-rose-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {banner.discount_tag && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">Use promo code:</span>
                      <button
                        onClick={() => banner.discount_tag && handleCopyCoupon(banner.discount_tag)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-950/90 border border-amber-500/50 text-amber-300 hover:text-amber-100 font-mono text-xs font-bold transition hover:bg-amber-900"
                      >
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>{banner.discount_tag}</span>
                        {copiedCode === banner.discount_tag ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                        ) : null}
                      </button>
                    </div>

                    {copiedCode === banner.discount_tag && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Applied to cart!
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
