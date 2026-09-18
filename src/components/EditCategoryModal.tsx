import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';
import { X, Layers, Loader2, Upload, AlertCircle } from 'lucide-react';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: { name: string; slug?: string; image?: string; specConfig?: any[] }) => Promise<void>;
  categoryToEdit?: Category | null;
  isLoading?: boolean;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryToEdit,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setSlug(categoryToEdit.slug || '');
      setImage(categoryToEdit.image || '');
    } else {
      setName('');
      setSlug('');
      setImage('');
    }
    setError(null);
    setImgError(false);
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setImgError(false);
          setImage(compressedBase64);
        } else {
          setImgError(false);
          setImage(rawDataUrl);
        }
      };
      img.onerror = () => {
        setImgError(false);
        setImage(rawDataUrl);
      };
      img.src = rawDataUrl;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim() || undefined,
        image: image || undefined,
        specConfig: categoryToEdit?.specConfig || [],
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/10 bg-slate-950 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {categoryToEdit ? 'Edit Category' : 'Create New Category'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {categoryToEdit ? `Updating ${categoryToEdit.name}` : 'Add master category taxonomy'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!categoryToEdit && !slug) {
                  // auto suggest slug
                }
              }}
              placeholder="e.g. Smartwatches"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Slug (Optional URL identifier)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. smartwatches"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-orange-500 transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Leave blank to automatically derive from category name.
            </p>
          </div>

          {/* Category Image Upload & Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Image
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {image && !imgError ? (
              <div className="relative group rounded-2xl bg-slate-900 border border-white/10 p-2 overflow-hidden flex items-center justify-center min-h-[130px]">
                <img
                  src={image}
                  alt="Preview"
                  onError={() => setImgError(true)}
                  className="max-h-32 w-full object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-md hover:bg-orange-600 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-white/10 bg-slate-900/60 hover:border-orange-500/50 hover:bg-slate-900'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-white mb-0.5">Click to upload category image</p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP (Auto-optimized)</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting || isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : categoryToEdit ? (
                'Save Changes'
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
