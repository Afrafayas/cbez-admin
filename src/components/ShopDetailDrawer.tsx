import React from 'react';
import { Shop } from '../types';
import { X, ShieldCheck, MapPin, Phone, MessageSquare, Tag, ShoppingBag, Star, Calendar } from 'lucide-react';

interface ShopDetailDrawerProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShopDetailDrawer: React.FC<ShopDetailDrawerProps> = ({ shop, isOpen, onClose }) => {
  if (!isOpen || !shop) return null;

  const products = shop.products || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl h-full border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 bg-slate-900/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-orange-500/30 border border-orange-400/30">
              {shop.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{shop.name}</h2>
                {shop.verified ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Store
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                    Pending Verification
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {shop.city}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  {shop.category}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {shop.rating ? shop.rating.toFixed(1) : '4.5'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-3 bg-slate-900/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">Store Contact Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Business Owner:</span>
                <p className="font-semibold text-white mt-0.5">{shop.ownerName}</p>
              </div>
              <div>
                <span className="text-slate-400">Physical Address:</span>
                <p className="font-semibold text-white mt-0.5">{shop.address || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400">Phone Contact:</span>
                <p className="font-semibold text-white mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  {shop.phone}
                </p>
              </div>
              <div>
                <span className="text-slate-400">WhatsApp Inquiry:</span>
                <p className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {shop.whatsapp}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                Store Catalog ({products.length} Products)
              </h3>
            </div>

            {products.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border border-white/5 text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-500" />
                <p className="text-xs font-semibold">No product listings found in this shop.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-xl glass-panel border border-white/5 hover:border-orange-500/30 transition-all bg-slate-900/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-white line-clamp-1">{product.name}</div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{product.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-white/5">
                      <span>Brand: {product.brand}</span>
                      <span>Stock: {product.stock} units</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Registered: {new Date(shop.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
