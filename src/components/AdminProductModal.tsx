import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { productSchema } from '../lib/validation';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, addProduct, updateProduct, updateProductStock, updateProductDiscount } = useStore();

  const [formData, setFormData] = useState({
    title: productToEdit?.title || '',
    slug: productToEdit?.slug || '',
    category_id: productToEdit?.category_id || '',
    category: (productToEdit?.category || (categories[0]?.name ?? 'Almonds')) as any,
    description: productToEdit?.description || '',
    stock: productToEdit?.stock || 50,
    discount_percentage: productToEdit?.discount_percentage || 0,
    price250g: productToEdit?.weight_options.find((w) => w.weight === '250g')?.price || 350,
    price500g: productToEdit?.weight_options.find((w) => w.weight === '500g')?.price || 680,
    price1kg: productToEdit?.weight_options.find((w) => w.weight === '1kg')?.price || 1300,
    image_url:
      productToEdit?.images[0] ||
      'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=800&q=80',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const matchedCategory = categories.find((c) => c.name === selectedName);
    setFormData((prev) => ({
      ...prev,
      category: selectedName,
      category_id: matchedCategory?.id || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const matchedCat = categories.find((c) => c.name === formData.category);
    const categoryId = formData.category_id || matchedCat?.id;

    const payload = {
      title: formData.title,
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      name: formData.title,
      teluguName: '',
      description: formData.description,
      category: formData.category,
      category_id: categoryId,
      stock: Number(formData.stock),
      inStock: Number(formData.stock) > 0,
      discount: Number(formData.discount_percentage),
      discount_percentage: Number(formData.discount_percentage),
      images: [formData.image_url],
      is_featured: false,
      pricePerWeight: {
        '250g': Number(formData.price250g),
        '500g': Number(formData.price500g),
        '1kg': Number(formData.price1kg),
      },
      weight_options: [
        { weight: '250g' as const, price: Number(formData.price250g), sku: `${formData.category.slice(0, 3).toUpperCase()}-250G` },
        { weight: '500g' as const, price: Number(formData.price500g), sku: `${formData.category.slice(0, 3).toUpperCase()}-500G` },
        { weight: '1kg' as const, price: Number(formData.price1kg), sku: `${formData.category.slice(0, 3).toUpperCase()}-1KG` },
      ],
    };

    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || 'Validation failed');
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        category: formData.category,
        category_id: categoryId,
        stock: Number(formData.stock),
        discount_percentage: Number(formData.discount_percentage),
        images: [formData.image_url],
        weight_options: payload.weight_options,
      });
      updateProductStock(productToEdit.id, Number(formData.stock));
      updateProductDiscount(productToEdit.id, Number(formData.discount_percentage));
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-900/50 rounded-2xl shadow-2xl text-stone-100 overflow-hidden">
        <div className="p-5 border-b border-amber-900/40 bg-stone-950/70 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-amber-200">
            {productToEdit ? 'Edit Product & Stock' : 'Add New Dry Fruit Catalog Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="m-4 p-3 bg-rose-950/80 border border-rose-600/70 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-stone-950 border border-stone-700 text-stone-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Category <span className="text-[10px] text-amber-400 font-normal">({categories.length} available)</span>
              </label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-3 py-1.5 rounded bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} {cat.is_active ? '' : '(Hidden)'}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Almonds">Almonds</option>
                    <option value="Walnuts">Walnuts</option>
                    <option value="Pistachios">Pistachios</option>
                    <option value="Dates & Figs">Dates & Figs</option>
                    <option value="Berries & Seeds">Berries & Seeds</option>
                    <option value="Gift Boxes">Gift Boxes</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Stock (Units)</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded bg-stone-950 border border-stone-700 text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-stone-950 border border-stone-700 text-stone-100"
              required
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">
              Weight Options (250g / 500g / 1kg Prices in ₹)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-stone-400">250g Price</span>
                <input
                  type="number"
                  value={formData.price250g}
                  onChange={(e) => setFormData({ ...formData, price250g: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-700 text-stone-100 text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-stone-400">500g Price</span>
                <input
                  type="number"
                  value={formData.price500g}
                  onChange={(e) => setFormData({ ...formData, price500g: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-700 text-stone-100 text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-stone-400">1kg Price</span>
                <input
                  type="number"
                  value={formData.price1kg}
                  onChange={(e) => setFormData({ ...formData, price1kg: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-700 text-stone-100 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discount_percentage}
              onChange={(e) =>
                setFormData({ ...formData, discount_percentage: Number(e.target.value) })
              }
              className="w-full px-3 py-1.5 rounded bg-stone-950 border border-stone-700 text-stone-100"
            />
          </div>

          {/* Supabase Storage Image Upload */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-stone-300 font-semibold">
              Product Image (Supabase Storage: bucket 'products')
            </label>
            <div className="flex items-center gap-3">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-12 h-12 rounded-lg object-cover bg-stone-950 border border-amber-900/40"
              />
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://... or upload below"
                  className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-700 text-[11px] text-stone-200 font-mono"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, image_url: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-[10px] text-stone-400 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-amber-600 file:text-stone-950 file:font-bold cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Save & Commit with Audit Trigger</span>
          </button>
        </form>
      </div>
    </div>
  );
};
