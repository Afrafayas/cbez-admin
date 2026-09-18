import React, { useState, useRef } from 'react';
import { Category, Brand } from '../types';
import { Plus, Edit2, Trash2, Tags, Bookmark, Search, Image as ImageIcon, AlertTriangle, ArrowLeft, Loader2, Layers, Upload, X } from 'lucide-react';

interface CategoriesBrandsViewProps {
  categories: Category[];
  brands: Brand[];
  onCreateCategory: (data: { name: string; slug?: string; image?: string }) => Promise<void>;
  onUpdateCategory: (id: string, data: { name?: string; slug?: string; image?: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onCreateBrand: (data: { name: string; logo?: string }) => Promise<void>;
  onUpdateBrand: (id: string, data: { name?: string; logo?: string }) => Promise<void>;
  onDeleteBrand: (id: string) => Promise<void>;
  isLoading: boolean;
  searchTerm?: string;
}

interface ImageUploadPreviewProps {
  label: string;
  imageValue: string;
  onChange: (val: string) => void;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({ label, imageValue, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1.5">{label}</label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {imageValue ? (
        <div className="relative group rounded-2xl bg-slate-900 border border-white/10 p-2 overflow-hidden flex items-center justify-center min-h-[130px]">
          <img
            src={imageValue}
            alt="Preview"
            className="max-h-32 w-full object-contain rounded-xl"
          />
          <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-md hover:bg-orange-600 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Change
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-white/10 bg-slate-900/60 hover:border-orange-500/50 hover:bg-slate-900'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto mb-2">
            <Upload className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-white mb-0.5">Click to upload image file</p>
          <p className="text-[10px] text-slate-400">PNG, JPG, WEBP (Max 5MB)</p>
        </div>
      )}
    </div>
  );
};

export const CategoriesBrandsView: React.FC<CategoriesBrandsViewProps> = ({
  categories,
  brands,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateBrand,
  onUpdateBrand,
  onDeleteBrand,
  isLoading,
  searchTerm = '',
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');
  const [localSearch, setLocalSearch] = useState('');

  // Modals state for Category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', image: '' });

  // Modals state for Brand
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({ name: '', logo: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveSearch = (localSearch || searchTerm).toLowerCase().trim();

  const filteredCategories = categories.filter(
    (c) => c.name.toLowerCase().includes(effectiveSearch) || (c.slug && c.slug.toLowerCase().includes(effectiveSearch))
  );

  const filteredBrands = brands.filter((b) => b.name.toLowerCase().includes(effectiveSearch));

  // Category Handlers
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', image: '' });
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, slug: cat.slug || '', image: cat.image || '' });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, categoryForm);
      } else {
        await onCreateCategory(categoryForm);
      }
      setShowCategoryModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      await onDeleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Brand Handlers
  const handleOpenCreateBrand = () => {
    setEditingBrand(null);
    setBrandForm({ name: '', logo: '' });
    setShowBrandModal(true);
  };

  const handleOpenEditBrand = (b: Brand) => {
    setEditingBrand(b);
    setBrandForm({ name: b.name, logo: b.logo || '' });
    setShowBrandModal(true);
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingBrand) {
        await onUpdateBrand(editingBrand.id, brandForm);
      } else {
        await onCreateBrand(brandForm);
      }
      setShowBrandModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteBrand = async () => {
    if (!deletingBrand) return;
    setIsSubmitting(true);
    try {
      await onDeleteBrand(deletingBrand.id);
      setDeletingBrand(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Tags className="w-5 h-5 text-orange-400" />
            Manage Categories & Brands
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic device categories, taxonomy slugs, and brand manufacturer master records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'categories' ? (
            <button
              onClick={handleOpenCreateCategory}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          ) : (
            <button
              onClick={handleOpenCreateBrand}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filter */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'brands'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Brands ({brands.length})
          </button>
        </div>

        {/* Local Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Main Table Content */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {activeTab === 'categories' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Category Image & Name</th>
                  <th className="p-4">URL Slug</th>
                  <th className="p-4">Associated Products</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      No categories found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{cat.name}</div>
                            <div className="text-[10px] text-slate-500">ID: {cat.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 border border-amber-500/20">
                          {cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-semibold">
                        {cat._count?.products ?? 0} Products
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            title="Edit Category"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(cat)}
                            title="Delete Category"
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Brand Logo & Name</th>
                  <th className="p-4">Associated Products</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400">
                      No brands found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {b.logo ? (
                              <img src={b.logo} alt={b.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <Bookmark className="w-4 h-4 text-orange-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{b.name}</div>
                            <div className="text-[10px] text-slate-500">ID: {b.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 font-semibold">
                        {b._count?.products ?? 0} Products
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditBrand(b)}
                            title="Edit Brand"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingBrand(b)}
                            title="Delete Brand"
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Create/Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Smartwatches"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Slug (Optional)</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="e.g. smartwatches"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Image File Upload with Preview */}
              <ImageUploadPreview
                label="Category Image File"
                imageValue={categoryForm.image}
                onChange={(val) => setCategoryForm({ ...categoryForm, image: val })}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Create/Edit Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h3>
            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="e.g. Apple, Samsung"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Logo File Upload with Preview */}
              <ImageUploadPreview
                label="Brand Logo Image File"
                imageValue={brandForm.logo}
                onChange={(val) => setBrandForm({ ...brandForm, logo: val })}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingBrand ? 'Save Changes' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden bg-slate-900/90 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Delete Category</h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to delete category{' '}
              <strong className="text-white font-bold">{deletingCategory.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Brand Modal */}
      {deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden bg-slate-900/90 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Delete Brand</h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to delete brand{' '}
              <strong className="text-white font-bold">{deletingBrand.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingBrand(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBrand}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
