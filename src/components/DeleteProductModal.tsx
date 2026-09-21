import React from 'react';
import { Product, getProductImages } from '../types';
import { Trash2, AlertTriangle, Loader2, ArrowLeft, Tag, ShoppingBag } from 'lucide-react';

interface DeleteProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !product) return null;

  const images = getProductImages(product);
  const thumbnail = images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-[#11141D]/95 p-6 sm:p-7 space-y-5 text-slate-100">
        {/* Soft Ambient Glows matching MLX Brand Palette */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Dual-tone Warning Icon */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500/20 via-orange-500/15 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 shadow-lg shadow-orange-500/10">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                Product Catalog Action
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-white mt-1">Delete Product Listing</h3>
            <p className="text-xs text-slate-400">Permanently remove this gadget from dealer store</p>
          </div>
        </div>

        {/* Product Preview Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-3.5 relative z-10">
          <div className="w-16 h-16 rounded-xl bg-slate-950 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-orange-400 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                {product.brand}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {product.category}
              </span>
            </div>
            <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
            <div className="text-xs font-black text-white mt-0.5 flex items-center gap-2">
              <span>₹{product.price ? product.price.toLocaleString('en-IN') : '0'}</span>
              {product.shop && (
                <span className="text-[10px] text-slate-400 font-normal truncate flex items-center gap-1">
                  • <ShoppingBag className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                  {product.shop.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notice Message */}
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs leading-relaxed relative z-10 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>
            Are you sure you want to delete this listing? This action cannot be reversed and will remove the item from all search results and customer feeds.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/5 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Keep Product</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Product</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

