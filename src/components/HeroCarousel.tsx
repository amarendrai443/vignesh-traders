import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface Slide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  coupon: string;
  tagline: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: '1',
    badge: 'Seasonal Harvest Special',
    title: 'Kashmiri Snow-White Walnuts & Afghani Anjeer',
    subtitle: 'Direct from orchard growers. Pure, unsweetened, and rich in natural essential oils.',
    image: 'https://images.unsplash.com/photo-1568271679468-8850b88f3077?auto=format&fit=crop&w=1400&q=80',
    coupon: 'ROYAL15',
    tagline: 'Flat 15% Festive Discount',
  },
  {
    id: '2',
    badge: 'Direct Wholesaler Pricing',
    title: 'California Jumbo Almonds & Irani Pistachios',
    subtitle: 'Vacuum sealed for unmatched freshness and crisp crunch. Available in 250g, 500g & 1kg packs.',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=1400&q=80',
    coupon: 'SHAHI20',
    tagline: 'Flat 20% Off above ₹1999',
  },
  {
    id: '3',
    badge: 'Artisanal Gift Sets',
    title: 'Imperial Handcrafted Dry Fruit Gift Hampers',
    subtitle: 'Wooden velvet-finish gift boxes designed for family celebrations, weddings & corporate gifting.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1400&q=80',
    coupon: 'ROYAL15',
    tagline: 'Complimentary Express Delivery',
  },
];

export const HeroCarousel: React.FC<{ onExploreClick: () => void }> = ({ onExploreClick }) => {
  const { banners } = useStore();
  const [current, setCurrent] = useState(0);
  const { applyCoupon } = useCart();
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const activeBanners = banners.filter((b) => (b.is_active ?? (b as any).active ?? true));
  const slides: Slide[] =
    activeBanners.length > 0
      ? activeBanners.map((b) => ({
          id: b.id,
          badge: b.discount_badge || (b as any).discount_tag || 'Festive Offer',
          title: b.title,
          subtitle: 'Direct from orchard growers. Pure, vacuum-sealed, and rich in natural nutrients.',
          image: b.image_url,
          coupon: b.discount_badge || (b as any).discount_tag || 'ROYAL15',
          tagline: b.target_link ? `Link: ${b.target_link}` : 'Wholesale Direct Deals',
        }))
      : HERO_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[current] || slides[0] || HERO_SLIDES[0];

  const handleApplyCoupon = (coupon: string) => {
    applyCoupon(coupon);
    setCopiedCoupon(coupon);
    navigator.clipboard?.writeText(coupon);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  return (
    <section className="relative overflow-hidden bg-[#F4EFEA] border-b border-[#EFE9DF] min-h-[360px] sm:min-h-[440px] flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover opacity-20 filter contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFEA] via-[#F4EFEA]/85 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <div className="max-w-2xl space-y-4">
          <motion.div
            key={`badge-${slide.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C87D32]/10 text-[#B45309] border border-[#C87D32]/30 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
            <span>{slide.badge}</span>
            <span className="text-[#B45309]/50">•</span>
            <span className="font-bold">{slide.tagline}</span>
          </motion.div>

          <motion.h1
            key={`title-${slide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#2D241E] leading-tight"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            key={`subtitle-${slide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#6E6359] text-xs sm:text-sm leading-relaxed max-w-xl"
          >
            {slide.subtitle}
          </motion.p>

          <motion.div
            key={`actions-${slide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C87D32] hover:bg-[#B45309] text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 transition"
            >
              <span>Shop Fresh Stock</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleApplyCoupon(slide.coupon)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EFE9DF] text-[#2D241E] hover:border-[#C87D32] font-mono text-xs font-semibold shadow-xs transition"
            >
              <Tag className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Use {slide.coupon}</span>
              {copiedCoupon === slide.coupon && (
                <span className="text-[10px] text-emerald-600 font-sans ml-1 font-bold">
                  (Applied!)
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-4 bottom-4 z-20 flex items-center gap-2">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-white/90 border border-[#EFE9DF] text-[#2D241E] hover:bg-white shadow-xs transition"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-white/90 border border-[#EFE9DF] text-[#2D241E] hover:bg-white shadow-xs transition"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              current === i ? 'w-6 bg-[#B45309]' : 'w-1.5 bg-[#EFE9DF]'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
