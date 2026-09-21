import React, { useState } from 'react';
import { Product, Shop } from '../types';
import {
  ArrowLeft,
  ShoppingBag,
  Store,
  MapPin,
  Phone,
  MessageSquare,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SingleProductViewProps {
  product: Product;
  onBack: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onViewShop?: (shop: Shop | { id: string; name: string }) => void;
}

export const SingleProductView: React.FC<SingleProductViewProps> = ({
  product,
  onBack,
  onEdit,
  onDelete,
  onViewShop,
}) => {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const specsList = product.specs ? Object.entries(product.specs) : [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Products</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span>Products</span>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Product</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(product)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl overflow-hidden">
            <div className="relative w-full aspect-square rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-white/5 group">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                }}
              />
              <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 font-mono">
                {activeImageIndex + 1} / {images.length}
              </span>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl bg-slate-950 border overflow-hidden shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-orange-500 shadow-md shadow-orange-500/20 ring-2 ring-orange-500/30'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Associated Seller Store Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-900/60 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Seller Store Listing
              </span>
              {product.shop?.verified && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Store
                </span>
              )}
            </div>

            {product.shop ? (
              <div
                onClick={() => onViewShop && onViewShop(product.shop as any)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-orange-500/40 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                    {product.shop.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors truncate flex items-center gap-1.5">
                      <span>{product.shop.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {product.shop.city || 'Store Location'} • {product.shop.ownerName || 'Verified Dealer'}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No store information linked.</p>
            )}

            {product.shop?.phone && (
              <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  <span>{product.shop.phone}</span>
                </span>
                {product.shop.whatsapp && (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{product.shop.whatsapp}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details, Pricing, Specs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Badges */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 border border-orange-500/30 text-orange-300">
                {product.brand}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-white/10 text-slate-300">
                {product.category}
              </span>
              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {product.stock} Units In Stock
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400">MRP Inclusive of all taxes</span>
            </div>

            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>
                Added on:{' '}
                <strong className="text-slate-300">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recent'}
                </strong>
              </span>
            </div>
          </div>

          {/* Description Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Product Description
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description || 'No detailed description provided by the seller for this item.'}
            </p>
          </div>

          {/* Technical Specifications */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              Technical Specifications
            </h2>

            {specsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {specsList.map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center"
                  >
                    <span className="text-slate-400 text-[11px] capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-white font-semibold mt-0.5 text-xs">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No custom technical specifications configured for this product.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
