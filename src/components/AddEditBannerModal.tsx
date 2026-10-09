import React, { useState, useEffect, useRef } from 'react';
import { Banner, Shop } from '../types';
import { X, Loader2, Upload, AlertCircle, Image as ImageIcon, Store, Megaphone, CheckCircle2 } from 'lucide-react';
import { uploadImageToS3 } from '../services/adminApi';

interface AddEditBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bannerData: {
    title: string;
    details?: string;
    image: string;
    type: 'banner' | 'ads';
    shopId?: string | null;
    isActive?: boolean;
  }) => Promise<void>;
  bannerToEdit?: Banner | null;
  shops: Shop[];
  isLoading?: boolean;
}

// Exactly two static dropdown options as specified in requirements
const BANNER_TYPE_OPTIONS = [
  {
    value: 'banner',
    label: 'Banner – For shop banners and marketing advertisements belonging to individual shops',
    shortLabel: 'Banner (Shop Banner)',
    description: 'Marketing advertisements & promotional banners belonging to individual shops',
  },
  {
    value: 'ads',
    label: 'Ads – For platform-wide deals and offers',
    shortLabel: 'Ads (Platform Deals)',
    description: 'Platform-wide promotions, seasonal offers, and direct deals',
  },
] as const;

export const AddEditBannerModal: React.FC<AddEditBannerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bannerToEdit,
  shops,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState('');
  const [bannerType, setBannerType] = useState<'banner' | 'ads'>('banner');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (bannerToEdit) {
      setTitle(bannerToEdit.title || '');
      setDetails(bannerToEdit.details || '');
      setImage(bannerToEdit.image || '');
      // When banner has a shopId, it represents a Shop Banner
      const mappedType = bannerToEdit.type === 'ads' || bannerToEdit.shopId ? 'banner' : 'ads';
      setBannerType(mappedType);
      setSelectedShopId(bannerToEdit.shopId || (bannerToEdit.shop?.id || ''));
      setIsActive(bannerToEdit.isActive !== undefined ? bannerToEdit.isActive : true);
    } else {
      setTitle('');
      setDetails('');
      setImage('');
      setBannerType('banner');
      setSelectedShopId('');
      setIsActive(true);
    }
    setError(null);
    setImgError(false);
  }, [bannerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsUploadingImg(true);
    setError(null);

    try {
      // Direct S3 upload using admin API
      const uploadedUrl = await uploadImageToS3(file, 'banners');
      if (uploadedUrl) {
        setImage(uploadedUrl);
        setImgError(false);
      } else {
        throw new Error('No URL returned from server upload.');
      }
    } catch (err: any) {
      console.warn('Direct upload failed, falling back to base64 compression:', err);
      // Fallback: client-side compress to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        if (!rawDataUrl) return;

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
            setImage(compressedBase64);
            setImgError(false);
          } else {
            setImage(rawDataUrl);
            setImgError(false);
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Banner title is required.');
      return;
    }

    const cleanImage = image.trim();
    if (!cleanImage) {
      setError('Banner image is required (please upload an image or provide a valid URL).');
      return;
    }

    if (bannerType === 'banner' && !selectedShopId) {
      setError('Please select an individual shop for the Shop Banner.');
      return;
    }

    setIsSubmitting(true);
    try {
      // In the database:
      // Shop-specific banner maps to type 'ads' with shopId (matches backend/frontend schema)
      // Platform-wide ads map to type 'banner' with shopId null
      const backendType = bannerType === 'banner' ? 'ads' : 'banner';
      const backendShopId = bannerType === 'banner' ? selectedShopId.trim() : null;

      await onSave({
        title: cleanTitle,
        details: details.trim() || undefined,
        image: cleanImage,
        type: backendType,
        shopId: backendShopId,
        isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save banner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {bannerToEdit ? 'Edit Banner / Ad' : 'Add New Banner / Ad'}
              </h3>
              <p className="text-xs text-slate-400">
                {bannerToEdit
                  ? 'Update promotion details and visibility'
                  : 'Create a new customer-facing banner or promotional ad'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            disabled={isSubmitting || isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Static Banner Type Dropdown (Exact Requirement 3) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Banner Type <span className="text-orange-500">*</span></span>
              <span className="text-[11px] text-slate-500 font-normal">Static options</span>
            </label>
            <div className="relative">
              <select
                value={bannerType}
                onChange={(e) => {
                  const val = e.target.value as 'banner' | 'ads';
                  setBannerType(val);
                  if (val === 'ads') {
                    setSelectedShopId('');
                  }
                }}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer appearance-none"
              >
                {BANNER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white py-2">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* Helper description for the selected type */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-400 flex items-start gap-2.5">
              {bannerType === 'banner' ? (
                <>
                  <Store className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-orange-300">Shop Banner: </span>
                    Belongs to an individual dealer shop. Customers can tap "Visit Store" to view all gadget listings from that shop.
                  </div>
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-300">Platform Ads: </span>
                    Platform-wide deals, offers, and seasonal discounts visible to all customers across the website.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Conditional Shop Selector (Only for 'banner' type) */}
          {bannerType === 'banner' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Select Shop <span className="text-orange-500">*</span></span>
                <span className="text-[11px] text-slate-500 font-normal">Associated dealer</span>
              </label>
              <div className="relative">
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer appearance-none"
                  required
                >
                  <option value="" disabled className="bg-slate-900 text-slate-500">
                    -- Choose an individual shop --
                  </option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id} className="bg-slate-900 text-white py-1.5">
                      {shop.name} {shop.city ? `(${shop.city})` : ''} {shop.verified ? '✓ Verified' : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Title <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Up to 40% Off on Certified Used iPhones"
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Details / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Details / Subtitle</span>
              <span className="text-[11px] text-slate-500 font-normal">Optional</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Hand-tested Grade A devices with store warranty. Direct deals, zero platform commission."
              rows={2}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Image Upload & Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Banner Image <span className="text-orange-500">*</span></span>
              <span className="text-[11px] text-slate-500 font-normal">PNG, JPG or WEBP (1200x600 recommended)</span>
            </label>

            {/* Dropzone / Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessFile(file);
              }}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/10 bg-slate-950/50 hover:border-white/20 hover:bg-slate-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessFile(file);
                }}
              />

              {isUploadingImg ? (
                <div className="flex flex-col items-center justify-center py-4 gap-2 text-orange-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-semibold">Uploading banner image to S3...</span>
                </div>
              ) : image && !imgError ? (
                <div className="space-y-3">
                  <div className="relative inline-block w-full max-h-48 rounded-lg overflow-hidden border border-white/10 bg-slate-950">
                    <img
                      src={image}
                      alt="Banner Preview"
                      className="w-full h-44 object-cover"
                      onError={() => setImgError(true)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                      <Upload className="w-4 h-4" /> Change Image
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Image attached successfully
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 gap-2 text-slate-400">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    Drag and drop your banner image here, or <span className="text-orange-400 underline">browse</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Supports high-res landscape banners</p>
                </div>
              )}
            </div>

            {/* Direct Image URL input as fallback */}
            <div className="pt-1">
              <input
                type="text"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setImgError(false);
                }}
                placeholder="Or paste direct image URL (e.g. https://...)"
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Active Status</div>
              <div className="text-xs text-slate-400">
                {isActive
                  ? 'Banner will be immediately visible on the customer website'
                  : 'Banner is paused and hidden from customers'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || isUploadingImg}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                bannerToEdit ? 'Save Changes' : 'Create Banner'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
