import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Sparkles,
  UserCheck,
  Code2,
  PhoneCall,
  Menu,
  X,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

export type NavTabId = 'home' | 'shop' | 'offers' | 'combo-offers' | 'my-orders' | 'contact';

export interface HeaderProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenArchitecture: () => void;
  onOpenAdmin: () => void;
}

export const NAV_LINKS: { id: NavTabId; label: string; href: string }[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'shop', label: 'Shop', href: '/shop' },
  { id: 'offers', label: 'Offers', href: '/offers' },
  { id: 'combo-offers', label: 'Combo Offers', href: '/combo-offers' },
  { id: 'my-orders', label: 'My Orders', href: '/my-orders' },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onOpenArchitecture,
  onOpenAdmin,
}) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { role } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tabId: NavTabId) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EFE9DF] text-[#2D241E] shadow-sm transition-all w-full">
      {/* Top micro-bar */}
      <div className="bg-[#F4EFEA] border-b border-[#EFE9DF] px-4 sm:px-6 py-1 text-xs text-[#6E6359] flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3 text-[11px]">
          <a
            href="tel:+919444810111"
            className="flex items-center gap-1 font-semibold text-[#B45309] hover:underline"
          >
            <PhoneCall className="w-3 h-3 text-[#25D366]" />
            <span>Direct Orders: +91 94448 10111</span>
          </a>
          <span className="hidden md:inline text-[#EFE9DF]">•</span>
          <span className="hidden md:inline text-[#6E6359]">
            Free Express Dispatch on Orders Above ₹999
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EFE9DF] hover:bg-[#E5DDD0] text-[#6E6359] transition font-mono text-[10px]"
          >
            <Code2 className="w-3 h-3 text-[#B45309]" />
            <span>Supabase RLS &amp; Specs</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#C87D32] hover:bg-[#B45309] text-white font-bold transition text-[10px] shadow-sm"
          >
            <UserCheck className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Header Row - Full Width with Responsive Padding & Safe Margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between w-full gap-2 sm:gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none flex-shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#C87D32] to-[#B45309] flex items-center justify-center shadow-sm flex-shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-wide text-[#2D241E]">
                VIGNESH
              </span>
              <span className="font-serif text-lg sm:text-2xl font-light text-[#C87D32]">
                TRADERS
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] tracking-widest text-[#6E6359] uppercase font-semibold mt-0.5">
              Premium Dry Fruits &amp; Nuts
            </p>
          </div>
        </div>

        {/* Desktop 6-Tab Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => handleTabClick(link.id)}
              className={`text-xs font-semibold tracking-wide transition-all relative py-1.5 ${
                currentTab === link.id
                  ? 'text-[#B45309] font-bold'
                  : 'text-[#6E6359] hover:text-[#2D241E]'
              }`}
            >
              {link.label}
              {currentTab === link.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#B45309] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Dynamic Search (Desktop) */}
          <div className="hidden md:flex relative w-44 lg:w-56">
            <Search className="w-3.5 h-3.5 text-[#6E6359] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search dry fruits..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#EFE9DF] text-[#2D241E] text-xs focus:outline-none focus:border-[#C87D32] placeholder:text-[#6E6359]/70"
            />
          </div>

          {/* Cart Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C87D32] hover:bg-[#B45309] text-white font-bold text-xs sm:text-sm shadow-sm transition transform active:scale-95"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Bag</span>
            {itemCount > 0 && (
              <span className="bg-white text-[#B45309] text-xs px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger Button - Fixed Dimensions & No Clipping */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 min-w-[40px] flex items-center justify-center p-2 rounded-lg bg-white border border-[#EFE9DF] text-[#2D241E] hover:bg-[#F4EFEA] transition touch-manipulation shadow-xs"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#2D241E]" /> : <Menu className="w-5 h-5 text-[#2D241E]" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Row */}
      <div className="md:hidden px-4 pb-3 w-full">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-[#6E6359] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search dry fruits, nuts, combo boxes..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#EFE9DF] text-[#2D241E] text-xs focus:outline-none focus:border-[#C87D32]"
          />
        </div>
      </div>

      {/* Mobile Off-Canvas / Slide-Out Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative ml-auto w-4/5 max-w-xs bg-[#FAF7F2] h-full shadow-2xl border-l border-[#EFE9DF] p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C87D32] flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-serif font-bold text-base text-[#2D241E]">
                    Vignesh Traders
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EFE9DF] text-[#6E6359]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 6 Tabs Links */}
              <nav className="flex flex-col space-y-1.5">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleTabClick(link.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
                      currentTab === link.id
                        ? 'bg-[#EFE9DF] text-[#B45309] font-bold'
                        : 'text-[#2D241E] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {currentTab === link.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Bottom Drawer WhatsApp Support Shortcut */}
            <div className="pt-6 border-t border-[#EFE9DF] space-y-3">
              <a
                href="https://wa.me/919444810111?text=Hello%20I%20have%20an%20inquiry%20about%20dry%20fruit%20orders"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp: +91 94448 10111</span>
              </a>

              <p className="text-[11px] text-[#6E6359] text-center leading-relaxed">
                Kakumanu Bazar, Narasaraopet - 522601, Palnadu Dist.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Also export as Navbar for backward compatibility
export const Navbar = Header;
export type NavbarProps = HeaderProps;
