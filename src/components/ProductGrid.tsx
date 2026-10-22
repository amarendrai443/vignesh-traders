import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  allProducts?: Product[];
  searchQuery?: string;
  selectedCategory?: string;
  onResetFilters?: () => void;
  onClearSearch?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  allProducts,
  searchQuery = '',
  selectedCategory = 'All',
  onResetFilters,
  onClearSearch,
}) => {
  const handleClear = onClearSearch || onResetFilters;

  // Case 1: Search yielded no matches - show neat banner and fallback catalog
  if (products.length === 0 && searchQuery.trim()) {
    const fallbackList = allProducts && allProducts.length > 0 ? allProducts : [];
    return (
      <div className="w-full space-y-4" id="products-section">
        <div className="bg-white rounded-2xl border border-[#EFE9DF] p-6 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF7F2] border border-[#EFE9DF] flex items-center justify-center text-[#B45309]">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#2D241E]">
            No dry fruits found matching &apos;{searchQuery}&apos;. Showing all products
          </p>
          {handleClear && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          )}
        </div>

        {fallbackList.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-2 sm:px-0 text-xs text-[#6E6359]">
              <span>
                All Catalog Items (<strong className="text-[#2D241E] font-bold">{fallbackList.length}</strong>)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 xl:gap-5 px-2 sm:px-0">
              {fallbackList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Case 2: General Empty State (no category items)
  if (products.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#EFE9DF] p-8 mx-2 sm:mx-0 shadow-xs" id="products-section">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] border border-[#EFE9DF] flex items-center justify-center text-[#B45309]">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#2D241E]">
          No products found
        </h3>
        <p className="text-[#6E6359] text-xs max-w-md mx-auto">
          There are currently no products listed under &quot;{selectedCategory}&quot;.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to View All</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 scroll-mt-24" id="products-section">
      {/* Category Results Count Header */}
      <div className="flex items-center justify-between px-2 sm:px-0 text-xs text-[#6E6359]">
        <span>
          Showing <strong className="text-[#2D241E] font-bold">{products.length}</strong> items in{' '}
          <strong className="text-[#B45309] font-bold">
            {searchQuery ? `Search: "${searchQuery}"` : selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </strong>
        </span>
      </div>

      {/* Strict 2-col on Mobile (`grid-cols-2 gap-3 px-2 sm:px-0`), Tablet 3-4 col, Strict 5-col on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 xl:gap-5 px-2 sm:px-0">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
