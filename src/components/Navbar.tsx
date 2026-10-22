import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Sparkles,
  PhoneCall,
  Menu,
  X,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useCart } from '../context/CartContext';

export interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenArchitecture?: () => void;
  onOpenAdmin?: () => void;
}

export const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'shop', label: 'Shop', href: '#shop' },
  { id: 'categories', label: 'Categories', href: '#categories' },
  { id: 'combo-packs', label: 'Combo Packs', href: '#combo-packs' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab = 'home',
  onSelectTab,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  onOpenArchitecture,
  onOpenAdmin,
}) => {
  const { totalCount, itemCount, setIsCartOpen } = useCart();
  const [internalSearch, setInternalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartBadgeCount = totalCount ?? itemCount ?? 0;
  const currentSearch = externalSearchQuery !== undefined ? externalSearchQuery : internalSearch;

  const handleSearchChange = (val: string) => {
    if (externalOnSearchChange) {
      externalOnSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const triggerSearchScroll = () => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById('products-section') || document.getElementById('shop');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      triggerSearchScroll();
    }
  };

  const handleLinkClick = (id: string) => {
    if (onSelectTab) {
      onSelectTab(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
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
            Kakumanu Bazar, Narasaraopet - 522601, Palnadu Dist.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenArchitecture && (
            <button
              onClick={onOpenArchitecture}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EFE9DF] hover:bg-[#E5DDD0] text-[#6E6359] transition font-mono text-[10px]"
            >
              <span>Specs</span>
            </button>
          )}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#C87D32] hover:bg-[#B45309] text-white font-bold transition text-[10px] shadow-sm"
            >
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-18 sm:min-h-20 py-2 flex items-center justify-between w-full gap-2 sm:gap-4">
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none flex-shrink-0"
        >
          <img
            src="https://i.ibb.co/s9tyVqzN/image.png"
            alt="Vignesh Traders Logo"
            className="h-11 sm:h-14 w-auto object-contain rounded-md flex-shrink-0"
          />
          <div>
            <h1 className="font-serif text-lg sm:text-2xl font-bold tracking-wide text-[#2D241E] leading-tight">
              Vignesh Traders
            </h1>
            <p className="text-[10px] sm:text-xs tracking-wide text-[#6E6359] font-medium leading-none mt-0.5">
              Dry Fruits &amp; Nuts
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
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
          {/* Desktop Search Bar */}
          <div className="hidden md:flex relative w-44 lg:w-60 items-center">
            <button
              type="button"
              onClick={triggerSearchScroll}
              aria-label="Search dry fruits"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#6E6359] hover:text-[#B45309] transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <input
              type="text"
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search dry fruits, nuts..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#EFE9DF] text-[#2D241E] text-xs focus:outline-none focus:border-[#C87D32] placeholder:text-[#6E6359]/70"
            />
          </div>

          {/* Dynamic Cart Counter Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C87D32] hover:bg-[#B45309] text-white font-bold text-xs sm:text-sm shadow-sm transition transform active:scale-95 cursor-pointer"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Bag</span>
            {cartBadgeCount > 0 && (
              <span className="bg-white text-[#B45309] text-xs px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {cartBadgeCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 min-w-[40px] flex items-center justify-center p-2 rounded-lg bg-white border border-[#EFE9DF] text-[#2D241E] hover:bg-[#F4EFEA] transition touch-manipulation shadow-xs cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#2D241E]" /> : <Menu className="w-5 h-5 text-[#2D241E]" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Row */}
      <div className="md:hidden px-4 pb-3 w-full">
        <div className="relative w-full flex items-center">
          <button
            type="button"
            onClick={triggerSearchScroll}
            aria-label="Search dry fruits"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#6E6359] hover:text-[#B45309] transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search dry fruits, nuts, combo boxes..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#EFE9DF] text-[#2D241E] text-xs focus:outline-none focus:border-[#C87D32]"
          />
        </div>
      </div>

      {/* Mobile/Tablet Drawer - Single Clean Backdrop (No Nested Modals) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Single Full-Height Slide-Out Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 max-w-[85vw] bg-[#FAF7F2] shadow-2xl border-l border-[#EFE9DF] p-6 flex flex-col justify-between transition-transform duration-300 lg:hidden overflow-y-auto">
          <div className="space-y-6">
            {/* Drawer Brand Header */}
            <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://i.ibb.co/s9tyVqzN/image.png"
                  alt="Vignesh Traders Logo"
                  className="h-8 w-8 object-contain rounded-md flex-shrink-0"
                />
                <div>
                  <span className="font-serif font-bold text-sm sm:text-base text-[#2D241E] block leading-tight">
                    Vignesh Traders
                  </span>
                  <span className="text-[10px] text-[#6E6359] block">
                    Dry Fruits &amp; Nuts
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#EFE9DF] text-[#6E6359] transition cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links with Full Width Touch Targets */}
            <nav className="flex flex-col space-y-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`py-3 px-4 rounded-lg hover:bg-[#EFE9DF]/60 text-base font-medium flex items-center justify-between transition text-left cursor-pointer ${
                    currentTab === link.id
                      ? 'bg-[#EFE9DF] text-[#B45309] font-bold'
                      : 'text-[#2D241E]'
                  }`}
                >
                  <span>{link.label}</span>
                  {currentTab === link.id && (
                    <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Drawer Contact & WhatsApp Support */}
          <div className="pt-6 border-t border-[#EFE9DF] space-y-3">
            <a
              href="https://wa.me/919444810111?text=Hello%20I%20have%20an%20inquiry%20about%20dry%20fruit%20orders"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>WhatsApp: +91 94448 10111</span>
            </a>

            <p className="text-[11px] text-[#6E6359] text-center leading-relaxed">
              Kakumanu Bazar, Narasaraopet - 522601, Palnadu Dist.
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
