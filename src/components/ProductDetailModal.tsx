import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, Store, MapPin, Phone, MessageSquare, Tag, ShieldCheck, CheckCircle2, AlertTriangle, Layers, ArrowLeft } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'];

  const specsList = product.specs ? Object.entries(product.specs) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
              <span>Back</span>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 border border-orange-400/30 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">{product.name}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="text-orange-400 font-semibold">{product.brand}</span>
                <span>•</span>
                <span>{product.category}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close Product Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Section: Images & Key Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-square w-full rounded-2xl bg-slate-900 border border-white/10 overflow-hidden relative group flex items-center justify-center">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                  }}
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-emerald-400">
                  ₹{product.price?.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl border overflow-hidden shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-orange-500 ring-2 ring-orange-500/40 opacity-100 scale-105'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Pricing Card */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center gap-2">
                    {product.stock > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        In Stock ({product.stock} units)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-3.5 rounded-2xl border border-white/5">
                    {product.description || 'No description provided for this product.'}
                  </p>
                </div>
              </div>

              {/* Shop Seller Info Card */}
              {product.shop && (
                <div className="p-4 rounded-2xl glass-panel border border-orange-500/20 bg-orange-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                      <Store className="w-4 h-4" />
                      <span>{product.shop.name}</span>
                    </div>
                    {product.shop.verified && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Verified Shop
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    {product.shop.ownerName && (
                      <div><span className="text-slate-400">Owner:</span> {product.shop.ownerName}</div>
                    )}
                    {product.shop.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-400" /> {product.shop.city}
                      </div>
                    )}
                    {product.shop.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-orange-400" /> {product.shop.phone}
                      </div>
                    )}
                    {product.shop.whatsapp && (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <MessageSquare className="w-3 h-3" /> {product.shop.whatsapp}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Table */}
          {specsList.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {specsList.map(([key, value]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="font-semibold text-slate-200 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <div>Listed on: {new Date(product.createdAt).toLocaleDateString()}</div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
