import React, { useState } from 'react';
import { Shop } from '../types';
import { X, ShieldCheck, ShieldAlert, MapPin, Phone, MessageSquare, Tag, ShoppingBag, Star, Calendar, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface ShopDetailDrawerProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleVerify?: (id: string, currentStatus: boolean) => Promise<void> | void;
}

export const ShopDetailDrawer: React.FC<ShopDetailDrawerProps> = ({ shop, isOpen, onClose, onToggleVerify }) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  if (!isOpen || !shop) return null;

  const products = shop.products || [];

  const handleActionVerify = async () => {
    if (!onToggleVerify) return;
    setIsVerifying(true);
    try {
      await onToggleVerify(shop.id, shop.verified);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl h-full border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl bg-slate-950/95">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-slate-900/80 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shrink-0 cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
            </button>

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-orange-500/30 border border-orange-400/30 shrink-0">
              {shop.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-white">{shop.name}</h2>
                {shop.verified ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Store
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Pending Verification
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
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
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">

          {/* Verification Audit Action Banner */}
          {!shop.verified ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">Pending Verification Audit</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-amber-500/20 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Category: <strong>{shop.category}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Contact: <strong>{shop.phone}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Catalog: <strong>{products.length} Products</strong></span>
                </div>
              </div>

              {onToggleVerify && (
                <button
                  onClick={handleActionVerify}
                  disabled={isVerifying}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Approve & Grant Verified Status</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-emerald-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>This store is verified and active on the platform.</span>
              </div>
              {onToggleVerify && (
                <button
                  onClick={handleActionVerify}
                  disabled={isVerifying}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
                >
                  Unverify
                </button>
              )}
            </div>
          )}

          {/* Subscription Usage Widget */}
          {shop.subscriptionUsage && (
            <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-2 bg-slate-900/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">💳 Subscription & Product Limit Usage</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Current Plan:</span>
                  <p className="font-bold text-white mt-0.5">{shop.subscriptionUsage.planName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Product Limit:</span>
                  <p className="font-bold text-amber-400 mt-0.5">{shop.subscriptionUsage.productLimit} Listings</p>
                </div>
                <div>
                  <span className="text-slate-400">Products Used:</span>
                  <p className="font-bold text-white mt-0.5">{shop.subscriptionUsage.currentProducts} Items</p>
                </div>
                <div>
                  <span className="text-slate-400">Remaining Slots:</span>
                  <p className="font-bold text-emerald-400 mt-0.5">{shop.subscriptionUsage.remaining} Slots</p>
                </div>
              </div>
            </div>
          )}

          {/* Store Contact Info */}
          <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-3 bg-slate-900/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">Store Contact & Business Info</h3>
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
                  {shop.whatsapp || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Catalog Products */}
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

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Registered: {new Date(shop.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            {!shop.verified && onToggleVerify && (
              <button
                onClick={handleActionVerify}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Approve Store</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

