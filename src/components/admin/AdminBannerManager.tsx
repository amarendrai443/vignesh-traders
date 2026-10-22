import React, { useState } from 'react';
import {
  Tag,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon,
  ExternalLink,
  Sparkles,
  RefreshCw,
  X,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Banner } from '../../types';

export const AdminBannerManager: React.FC = () => {
  const { banners, addBanner, updateBanner, deleteBanner, toggleBannerStatus } = useStore();

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    target_link: '/shop',
    discount_badge: '',
    display_order: 1,
    is_active: true,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image_url: '',
      target_link: '/shop',
      discount_badge: '',
      display_order: banners.length > 0 ? Math.max(...banners.map((b) => b.display_order)) + 1 : 1,
      is_active: true,
    });
    setImagePreview('');
  };

  const handleStartEdit = (ban: Banner) => {
    setEditingBanner(ban);
    setFormData({
      title: ban.title,
      image_url: ban.image_url,
      target_link: ban.target_link || '/shop',
      discount_badge: ban.discount_badge || (ban as any).discount_tag || '',
      display_order: ban.display_order || 1,
      is_active: ban.is_active ?? (ban as any).active ?? true,
    });
    setImagePreview(ban.image_url);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setStatusMessage('Please enter a banner title.');
      return;
    }

    const finalImage =
      formData.image_url.trim() ||
      'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=1200&q=80';

    if (editingBanner) {
      updateBanner(editingBanner.id, {
        title: formData.title.trim(),
        image_url: finalImage,
        target_link: formData.target_link.trim() || '/shop',
        discount_badge: formData.discount_badge.trim() || undefined,
        display_order: Number(formData.display_order) || 1,
        is_active: formData.is_active,
      });
      setStatusMessage(`Banner "${formData.title}" updated.`);
    } else {
      addBanner({
        title: formData.title.trim(),
        image_url: finalImage,
        target_link: formData.target_link.trim() || '/shop',
        discount_badge: formData.discount_badge.trim() || undefined,
        display_order: Number(formData.display_order) || 1,
        is_active: formData.is_active,
      });
      setStatusMessage(`Banner "${formData.title}" added to showcase.`);
    }

    resetForm();
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete banner "${title}"?`)) {
      deleteBanner(id);
      setStatusMessage(`Banner "${title}" removed.`);
      setTimeout(() => setStatusMessage(null), 3000);
      if (editingBanner?.id === id) resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE9DF] pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2D241E] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C87D32]" />
            Promotional Offers &amp; Banners Manager
          </h2>
          <p className="text-xs text-[#6E6359] mt-0.5">
            Create high-converting hero carousel banners, festive promo tags, and target redirect links.
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-[#C87D32]/10 text-[#C87D32] border border-[#C87D32]/20">
          {banners.filter((b) => b.is_active ?? (b as any).active).length} Active / {banners.length} Total
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
            <PlusCircle className="w-4 h-4 text-[#C87D32]" />
            {editingBanner ? `Edit Banner: ${editingBanner.title}` : 'Create New Promotional Banner'}
          </h3>
          {editingBanner && (
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
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#2D241E] mb-1">
                Banner Title / Heading <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Royal Kashmiri Walnuts - Flat 20% Off"
                required
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EFE9DF] bg-[#FAF7F2] text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#C87D32]/20 focus:border-[#C87D32]"
              />
            </div>

            {/* Discount Badge */}
            <div>
              <label className="block text-xs font-semibold text-[#2D241E] mb-1">
                Discount Tag / Offer Badge
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6E6359]" />
                <input
                  type="text"
                  value={formData.discount_badge}
                  onChange={(e) => setFormData({ ...formData, discount_badge: e.target.value })}
                  placeholder="e.g. FESTIVE20 or FLAT 15% OFF"
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#EFE9DF] bg-[#FAF7F2] text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#C87D32]/20 focus:border-[#C87D32]"
                />
              </div>
            </div>

            {/* Target Link */}
            <div>
              <label className="block text-xs font-semibold text-[#2D241E] mb-1">
                Target Action Link
              </label>
              <div className="relative">
                <ExternalLink className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6E6359]" />
                <input
                  type="text"
                  value={formData.target_link}
                  onChange={(e) => setFormData({ ...formData, target_link: e.target.value })}
                  placeholder="/shop, /almonds, /combo-deals"
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#EFE9DF] bg-[#FAF7F2] text-[#2D241E] font-mono focus:outline-none focus:ring-2 focus:ring-[#C87D32]/20 focus:border-[#C87D32]"
                />
              </div>
            </div>
          </div>

          {/* Image & Display Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#2D241E] mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#C87D32]" />
                Banner Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value });
                  setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/photo-..."
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

            {/* Display Order & Active Toggle */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EFE9DF] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-[#2D241E]">
                    Display Order
                  </label>
                  <span className="text-[11px] text-[#6E6359]">Sequence in carousel</span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                  className="w-20 text-xs px-2.5 py-1.5 rounded-lg border border-[#EFE9DF] bg-white text-[#2D241E] font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#C87D32]/20"
                />
              </div>

              <div className="pt-2 border-t border-[#EFE9DF]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C87D32] focus:ring-[#C87D32] border-[#EFE9DF]"
                  />
                  <span className="text-xs font-semibold text-[#2D241E]">
                    Display in Storefront Hero Carousel
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Banner Live Preview Bar */}
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-[#EFE9DF] h-32 w-full bg-stone-900 shadow-inner">
              <img src={imagePreview} alt="Live Banner Preview" className="w-full h-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent flex flex-col justify-center px-6">
                {formData.discount_badge && (
                  <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C87D32] text-white mb-1 shadow-sm">
                    {formData.discount_badge}
                  </span>
                )}
                <h4 className="font-serif font-bold text-white text-base drop-shadow-sm">
                  {formData.title || 'Banner Title'}
                </h4>
                <span className="text-[10px] text-amber-200/90 font-mono mt-0.5">
                  Target: {formData.target_link}
                </span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFE9DF]">
            {editingBanner && (
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
              {editingBanner ? <RefreshCw className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
              <span>{editingBanner ? 'Save Banner' : 'Publish Banner'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Banners Showcase */}
      <div className="bg-white rounded-2xl border border-[#EFE9DF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFE9DF] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2D241E] flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#C87D32]" />
            Configured Banners ({banners.length})
          </h3>
          <span className="text-[11px] text-[#6E6359]">Carousel order priority</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {banners.map((b) => {
            const isActive = b.is_active ?? (b as any).active ?? true;
            const badge = b.discount_badge || (b as any).discount_tag;

            return (
              <div
                key={b.id}
                className={`rounded-2xl border transition overflow-hidden flex flex-col justify-between ${
                  isActive ? 'border-[#EFE9DF] bg-[#FAF7F2]/40 shadow-sm' : 'border-stone-200 bg-stone-50 opacity-70'
                }`}
              >
                {/* Visual Header */}
                <div className="relative h-32 w-full bg-stone-900">
                  <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-3">
                    <div className="w-full flex items-center justify-between text-white">
                      <span className="font-mono text-[10px] bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                        Order #{b.display_order}
                      </span>
                      {badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C87D32] text-white shadow-sm">
                          {badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-serif font-bold text-[#2D241E] text-sm line-clamp-1">{b.title}</h4>
                    <p className="text-[11px] font-mono text-[#6E6359] mt-0.5 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-[#C87D32]" />
                      Link: {b.target_link || '/shop'}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#EFE9DF]">
                    {/* Toggle Status Button */}
                    <button
                      onClick={() => toggleBannerStatus(b.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-200 text-stone-600 border border-stone-300 hover:bg-stone-300'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(b)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-[#C87D32] hover:bg-white transition"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.title)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
