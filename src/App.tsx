import React, { useState, useMemo, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductGrid } from './components/ProductGrid';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';

function StorefrontApp() {
  const { products, categories } = useStore();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');

  // Lock body scroll while splash screen is visible
  useEffect(() => {
    if (showSplash) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showSplash]);

  // Filter products in real-time based on search query or category
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return products.filter((product) => {
      // Real-time search by English name, Telugu name, category, or description
      if (q) {
        const title = (product.title || product.name || '').toLowerCase();
        const telugu = (product.teluguName || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const cat = (product.category || '').toLowerCase();
        return (
          title.includes(q) ||
          telugu.includes(q) ||
          desc.includes(q) ||
          cat.includes(q)
        );
      }

      // Category filter when not actively searching
      if (selectedCategory !== 'All') {
        const catLower = selectedCategory.toLowerCase();
        const prodCatLower = (product.category || '').toLowerCase();
        if (catLower === 'combos' || catLower === 'combo packs') {
          return prodCatLower === 'combos' || prodCatLower === 'gift boxes';
        }
        return prodCatLower === catLower;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const scrollToProducts = () => {
    const el = document.getElementById('products-section') || document.getElementById('shop');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabId === 'shop') {
      setSelectedCategory('All');
      setSearchQuery('');
      scrollToProducts();
    } else if (tabId === 'categories') {
      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'combo-packs') {
      setSelectedCategory('Combos');
      setSearchQuery('');
      scrollToProducts();
    } else if (tabId === 'contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShopScroll = () => {
    scrollToProducts();
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-[#FAF7F2] text-[#2D241E] font-sans antialiased">
      {/* 0. Introductory 5-second Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Stationary Fixed Background Watermark Centered in Visible Viewport */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 top-16 sm:top-20 pointer-events-none z-0 flex items-center justify-center overflow-hidden"
      >
        <img
          src="https://i.ibb.co/s9tyVqzN/image.png"
          alt="Vignesh Traders Watermark"
          className="w-72 sm:w-[450px] md:w-[550px] opacity-[0.08] object-contain select-none filter grayscale contrast-125"
        />
      </div>

      {/* 1. Global Frozen Header */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container with Offset to Prevent Header Overlap */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 space-y-6 sm:space-y-8">
        {/* 2. Hero Promotional Banner & Quality Assurance Badges */}
        <section id="home" className="scroll-mt-32">
          <HeroBanner onShopClick={handleShopScroll} />
        </section>

        {/* 3. Shop by Category Circular Thumbnail Bar */}
        <div id="categories" className="scroll-mt-32">
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catName) => {
              setSelectedCategory(catName);
              setSearchQuery('');
              scrollToProducts();
            }}
          />
        </div>

        {/* 4. Strict Responsive Product Grid */}
        <div id="products-section" className="scroll-mt-32">
          <ProductGrid
            products={filteredProducts}
            allProducts={products}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onClearSearch={() => setSearchQuery('')}
            onResetFilters={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
          />
        </div>
      </main>

      {/* 5. Slide-Out Cart Drawer with Direct WhatsApp Checkout */}
      <CartDrawer />

      {/* 6. Persistent Floating WhatsApp Widget */}
      <WhatsAppWidget />

      {/* 7. Footer with Store Address, Phone, Hours, and Copyright */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <StorefrontApp />
      </CartProvider>
    </StoreProvider>
  );
}
