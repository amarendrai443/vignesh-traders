import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Category } from '../types';

export interface CategoryItem {
  id: string;
  name: string;
  label: string;
  teluguLabel?: string;
  imageUrl: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-almonds',
    name: 'Almonds',
    label: 'Almonds',
    teluguLabel: 'బాదం',
    imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-cashews',
    name: 'Cashews',
    label: 'Cashews',
    teluguLabel: 'జీడిపప్పు',
    imageUrl: 'https://images.unsplash.com/photo-1509912760295-88574a49c952?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-pistachios',
    name: 'Pistachios',
    label: 'Pistachios',
    teluguLabel: 'పిస్తా',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-dates-figs',
    name: 'Dates & Figs',
    label: 'Dates & Figs',
    teluguLabel: 'అంజీర & ఖర్జూరం',
    imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-combos',
    name: 'Combos',
    label: 'Combos',
    teluguLabel: 'గిఫ్ట్ బాక్సులు',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
  },
];

interface CategoryBarProps {
  categories?: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const isViewAll = selectedCategory === 'All' || !selectedCategory;

  // Build the list of categories to display
  const displayCategories: CategoryItem[] = React.useMemo(() => {
    if (categories && categories.length > 0) {
      return categories
        .filter((c) => c.is_active !== false)
        .map((c) => ({
          id: c.id,
          name: c.name,
          label: c.name === 'Gift Boxes' ? 'Combos' : c.name,
          teluguLabel: c.teluguName,
          imageUrl: c.image_url,
        }));
    }
    return DEFAULT_CATEGORIES;
  }, [categories]);

  return (
    <section className="w-full py-3 sm:py-5" id="categories">
      <div className="flex items-center justify-between mb-3 px-2 sm:px-0">
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2D241E]">
            Shop by Category
          </h2>
          <p className="text-xs text-[#6E6359]">
            Select a category to filter the premium 5x5 collection
          </p>
        </div>
        {!isViewAll && (
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs font-semibold text-[#B45309] hover:underline cursor-pointer"
          >
            Show All Products
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Circular Thumbnails Bar */}
      <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 px-2 sm:px-0 scrollbar-none snap-x">
        {/* "View All" Circular Option */}
        <button
          onClick={() => onSelectCategory('All')}
          className="group flex flex-col items-center flex-shrink-0 text-center focus:outline-none snap-start cursor-pointer"
        >
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-200 border-2 shadow-xs ${
              isViewAll
                ? 'bg-[#B45309] border-[#B45309] text-white ring-4 ring-[#B45309]/20 scale-105 shadow-md'
                : 'bg-white border-[#EFE9DF] text-[#6E6359] group-hover:border-[#B45309]/60 group-hover:text-[#2D241E]'
            }`}
          >
            <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
          </div>
          <span
            className={`mt-2 text-xs transition-colors whitespace-nowrap ${
              isViewAll
                ? 'font-bold text-[#B45309]'
                : 'font-medium text-[#6E6359] group-hover:text-[#2D241E]'
            }`}
          >
            View All
          </span>
          <span className="text-[10px] text-[#A89E92]">అన్నీ</span>
        </button>

        {/* Circular Category Thumbnails */}
        {displayCategories.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
            (cat.name === 'Combos' && selectedCategory.toLowerCase() === 'gift boxes') ||
            (cat.name === 'Gift Boxes' && selectedCategory.toLowerCase() === 'combos');

          return (
            <button
              key={cat.id || cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="group flex flex-col items-center flex-shrink-0 text-center focus:outline-none snap-start cursor-pointer"
            >
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden transition-all duration-200 border-2 bg-[#FAF7F2] shadow-xs ${
                  isSelected
                    ? 'border-[#B45309] ring-4 ring-[#B45309]/25 scale-105 shadow-md'
                    : 'border-[#EFE9DF] group-hover:border-[#B45309]/60'
                }`}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <span
                className={`mt-2 text-xs transition-colors whitespace-nowrap max-w-[80px] sm:max-w-[90px] truncate ${
                  isSelected
                    ? 'font-bold text-[#B45309]'
                    : 'font-medium text-[#6E6359] group-hover:text-[#2D241E]'
                }`}
                title={cat.label}
              >
                {cat.label}
              </span>
              {cat.teluguLabel && (
                <span className="text-[10px] text-[#A89E92] truncate max-w-[80px]">
                  {cat.teluguLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
