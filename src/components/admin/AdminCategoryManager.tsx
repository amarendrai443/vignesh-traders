import React, { useState } from 'react';
import {
  FolderPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Link as LinkIcon,
  Layers,
  ArrowUpDown,
  RefreshCw,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';

export const AdminCategoryManager: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image_url: '',
    display_order: 1,
    is_active: true,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      image_url: '',
      display_order: (categories.length > 0 ? Math.max(...categories.map((c) => c.display_order)) + 1 : 1),
      is_active: true,
    });
    setImagePreview('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order ?? 1,
      is_active: cat.is_active ?? true,
    });
    setImagePreview(cat.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData((prev) => ({ ...prev, image_url: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingCategory ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMessage('Please enter a valid category name.');
      return;
    }

    const finalImage =
      formData.image_url.trim() ||
      'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80';
    const finalSlug =
      formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        slug: finalSlug,
        image_url: finalImage,
        display_order: Number(formData.display_order) || 1,
        is_active: formData.is_active,
      });
      setStatusMessage(`Category "${formData.name}" updated successfully.`);
    } else {
      addCategory({
        name: formData.name.trim(),
        slug: finalSlug,
        image_url: finalImage,
        display_order: Number(formData.display_order) || 1,
        is_active: formData.is_active,
      });
      setStatusMessage(`Category "${formData.name}" created successfully.`);
    }

    resetForm();
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    const linkedCount = products.filter(
      (p) => p.category_id === id || p.category.toLowerCase() === name.toLowerCase()
    ).length;

    const confirmMsg = linkedCount > 0
      ? `Category "${name}" is linked to ${linkedCount} product(s). Are you sure you want to delete it?`
      : `Delete category "${name}"?`;

    if (window.confirm(confirmMsg)) {
      deleteCategory(id);
      setStatusMessage(`Category "${name}" deleted.`);
      setTimeout(() => setStatusMessage(null), 3000);
      if (editingCategory?.id === id) resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE9DF] pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2D241E] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C87D32]" />
            Category Catalog Manager
          </h2>
          <p className="text-xs text-[#6E6359] mt-0.5">
            Organize dry fruits and nuts into navigable categories with custom images &amp; display sorting.
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-[#C87D32]/10 text-[#C87D32] border border-[#C87D32]/20">
          {categories.length} Total Categories
        </span>
      </div>

      {statusMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-amber-700 hover:text-amber-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-[#EFE9DF] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EFE9DF]">
          <h3 className="text-sm font-bold text-[#2D241E] flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-[#C87D32]" />
            {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
          </h3>
          {editingCategory && (
            <button
              onClick={resetForm}
              className="text-xs text-[#6E6359] hover:text-[#2D241E] flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-semibold text-[#2D241E] mb-1">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Premium Almonds"
                required
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EFE9DF] bg-[#FAF7F2] text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#C87D32]/20 focus:border-[#C87D32]"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-[#2D241E] mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. premium-almonds"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EFE9DF] bg-[#FAF7F2] text-[#2D241E] font-mono focus:outline-none focus:ring-2 focus:ring-[#C87D32]/20 focus:border-[#C87D32]"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-xs font-semibold text-[#2D241E] mb-1">
                Display Order <span className="text-xs text-[#6E6359] font-normal">(lower shows first)</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EFE9DF] bg-[#FAF7F2] text-[#2D241E] font-mono focus:outline-none focus:ring-2 focus:ring-[#C87D32]/20 focus:border-[#C87D32]"
              />
            </div>
          </div>

          {/* Category Image Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#2D241E] mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#C87D32]" />
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value });
                  setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#EFE9DF] bg-[#FAF7F2] text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#C87D32]/20 focus:border-[#C87D32]"
              />
              <div className="mt-2">
                <label className="text-[11px] font-medium text-[#6E6359] block mb-1 flex items-center gap-1">
                  <Upload className="w-3 h-3 text-[#C87D32]" /> Or upload image file:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-xs text-[#6E6359] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C87D32]/10 file:text-[#C87D32] hover:file:bg-[#C87D32]/20 cursor-pointer"
                />
              </div>
            </div>

            {/* Preview Box & Active Toggle */}
            <div className="flex items-center gap-4 bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE9DF]">
              <div className="w-16 h-16 rounded-xl bg-white border border-[#EFE9DF] overflow-hidden flex-shrink-0 flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Layers className="w-6 h-6 text-[#6E6359]/40" />
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C87D32] focus:ring-[#C87D32] border-[#EFE9DF]"
                  />
                  <span className="text-xs font-semibold text-[#2D241E]">Active in Storefront</span>
                </label>
                <p className="text-[11px] text-[#6E6359]">
                  Inactive categories are hidden from customer category pills and navigation.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFE9DF]">
            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#6E6359] hover:bg-stone-100 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#C87D32] hover:bg-[#B45309] text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              {editingCategory ? <RefreshCw className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5" />}
              <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Categories List Table */}
      <div className="bg-white rounded-2xl border border-[#EFE9DF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFE9DF] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2D241E] flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#C87D32]" />
            Existing Categories ({categories.length})
          </h3>
          <span className="text-[11px] text-[#6E6359]">Sorted by display order</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#6E6359] uppercase tracking-wider font-semibold border-b border-[#EFE9DF]">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-center">Linked Products</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DF] text-[#2D241E]">
              {categories.map((cat) => {
                const linkedCount = products.filter(
                  (p) => p.category_id === cat.id || p.category.toLowerCase() === cat.name.toLowerCase()
                ).length;

                return (
                  <tr key={cat.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-[#C87D32]">
                      #{cat.display_order}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-[#EFE9DF] flex-shrink-0"
                        />
                        <span className="font-semibold text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-stone-500 text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold text-[11px]">
                        {linkedCount} items
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => updateCategory(cat.id, { is_active: !cat.is_active })}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {cat.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-stone-400" /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#C87D32] hover:bg-[#FAF7F2] transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
