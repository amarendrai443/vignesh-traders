import React from 'react';
import { Sparkles, ShieldCheck, Award, IndianRupee, ArrowRight, MessageCircle } from 'lucide-react';

interface HeroBannerProps {
  onShopClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopClick }) => {
  const whatsappUrl = `https://wa.me/919444810111?text=${encodeURIComponent(
    'Namaste Vignesh Traders! I would like to inquire about festive offers and bulk dry fruit orders.'
  )}`;

  return (
    <div className="w-full space-y-4 pt-2 pb-4">
      {/* Main Promotional Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#2D241E] via-[#3D2C22] to-[#1E1712] text-white shadow-lg border border-[#EFE9DF]/20">
        {/* Ambient background image */}
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80"
            alt="Premium Festive Dry Fruits Vignesh Traders"
            className="w-full h-full object-cover scale-105"
          />
        </div>

        {/* Ambient gradient glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#B45309]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 px-5 py-7 sm:px-10 sm:py-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B45309]/30 border border-[#B45309]/50 text-[#F59E0B] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seasonal Festival Special Offer</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#FAF7F2]">
              Direct From Orchards <br className="hidden sm:inline" />
              <span className="text-[#FBBF24]">Pure &amp; Handpicked Dry Fruits</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#E5DCD0] max-w-2xl leading-relaxed">
              Serving authentic California Almonds, Jumbo Cashews, Kashmiri Walnuts, and festive combo hampers from Kakumanu Bazar, Narasaraopet. Wholesome freshness delivered directly to your doorstep.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onShopClick}
              className="px-5 py-2.5 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 group"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Instant Order</span>
            </a>

            <div className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-amber-200">
              <span className="font-mono font-bold text-white">CODE: FESTIVE15</span>
              <span className="text-white/70">| Flat 15% Off</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Assurance Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#EFE9DF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE9DF] flex items-center justify-center text-[#B45309] flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#2D241E]">100% Natural &amp; Pure</h3>
            <p className="text-[11px] text-[#6E6359]">Zero additives, chemical-free and freshly sorted</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#EFE9DF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE9DF] flex items-center justify-center text-[#B45309] flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#2D241E]">Handpicked Quality</h3>
            <p className="text-[11px] text-[#6E6359]">Export grade W240 cashews &amp; premium California nuts</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#EFE9DF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE9DF] flex items-center justify-center text-[#B45309] flex-shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#2D241E]">Best Price Guarantee</h3>
            <p className="text-[11px] text-[#6E6359]">Genuine wholesale &amp; retail rates with doorstep delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
};
