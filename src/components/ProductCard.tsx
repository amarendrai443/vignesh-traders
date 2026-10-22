import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product, WeightUnit } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const [selectedWeight, setSelectedWeight] = useState<WeightUnit>(
    product.weight_options[0]?.weight || '250g'
  );
  const [isAdded, setIsAdded] = useState(false);

  const currentOption =
    product.weight_options.find((opt) => opt.weight === selectedWeight) ||
    product.weight_options[0];

  const handleAddToCart = () => {
    if (!product.inStock && product.stock <= 0) return;
    addItem(product, selectedWeight, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const isOutOfStock = !product.inStock || product.stock <= 0;
  const discountVal = product.discount_percentage ?? product.discount ?? 0;

  return (
    <div className="group relative bg-white rounded-xl sm:rounded-2xl border border-[#EFE9DF] overflow-hidden shadow-xs hover:shadow-md hover:border-[#B45309]/50 transition-all duration-300 flex flex-col justify-between h-full">
      {/* Featured / Discount Badges */}
      <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 pointer-events-none">
        {discountVal > 0 && (
          <span className="bg-[#B45309] text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md shadow-xs">
            {discountVal}% OFF
          </span>
        )}
        {product.is_featured && (
          <span className="bg-[#FAF7F2] text-[#B45309] border border-[#B45309]/30 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md shadow-xs">
            Bestseller
          </span>
        )}
      </div>

      {/* Product Image - Strict Aspect Square */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FAF7F2]">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1509912760295-88574a49c952?auto=format&fit=crop&w=600&q=80'}
          alt={product.title || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Compact Card Content optimized for 5-Column Desktop & 2-Column Mobile */}
      <div className="p-2.5 sm:p-3 xl:p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1 font-semibold">
            <span className="text-[#B45309] truncate max-w-[70%]">{product.category}</span>
            <span
              className={`text-[9px] sm:text-[10px] font-medium ${
                isOutOfStock ? 'text-rose-600 font-bold' : 'text-emerald-700'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : 'Fresh Stock'}
            </span>
          </div>

          <h3 className="font-serif font-bold text-[#2D241E] text-xs sm:text-sm leading-snug group-hover:text-[#B45309] transition-colors line-clamp-2 min-h-[2rem]">
            {product.title || product.name}
          </h3>

          {product.teluguName && (
            <p className="text-[10px] text-[#A89E92] truncate mt-0.5">
              {product.teluguName}
            </p>
          )}
        </div>

        {/* Dynamic Weight Selector & Live Pricing */}
        <div className="pt-2 border-t border-[#EFE9DF] space-y-2">
          {/* Weight Option Pills */}
          <div className="grid grid-cols-3 gap-1">
            {product.weight_options.map((opt) => (
              <button
                key={opt.weight}
                type="button"
                onClick={() => setSelectedWeight(opt.weight)}
                className={`py-1 text-[10px] sm:text-[11px] font-semibold rounded-md border text-center transition-all cursor-pointer ${
                  selectedWeight === opt.weight
                    ? 'bg-[#B45309] text-white border-[#B45309] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#6E6359] border-[#EFE9DF] hover:border-[#B45309]/50 hover:text-[#2D241E]'
                }`}
              >
                {opt.weight}
              </button>
            ))}
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline justify-between gap-1 pt-0.5">
            <div className="flex items-baseline gap-1.5 truncate">
              <span className="text-sm sm:text-base xl:text-lg font-bold font-serif text-[#2D241E]">
                ₹{currentOption?.price || 0}
              </span>
              {currentOption?.compare_at_price && (
                <span className="text-[10px] sm:text-xs text-[#6E6359] line-through">
                  ₹{currentOption.compare_at_price}
                </span>
              )}
            </div>
            <span className="text-[9px] text-[#6E6359] font-mono">
              ₹{(currentOption?.price || 0) / (selectedWeight === '250g' ? 0.25 : selectedWeight === '500g' ? 0.5 : 1)}/kg
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              isOutOfStock
                ? 'bg-[#EFE9DF] text-[#6E6359] cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#B45309] hover:bg-[#92400E] text-white active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
