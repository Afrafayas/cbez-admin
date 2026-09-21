import React, { useState } from 'react';
import { Shop, Product, getShopProductCount, getProductImages } from '../types';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  MessageSquare,
  Tag,
  ShoppingBag,
  Star,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Plus,
  Eye,
} from 'lucide-react';

interface SingleShopViewProps {
  shop: Shop;
  onBack: () => void;
  onToggleVerify?: (id: string, currentStatus: boolean) => Promise<void> | void;
  onEdit?: (shop: Shop) => void;
  onDelete?: (shop: Shop) => void;
  onViewProduct?: (product: Product) => void;
  onAddProduct?: () => void;
}

export const SingleShopView: React.FC<SingleShopViewProps> = ({
  shop,
  onBack,
  onToggleVerify,
  onEdit,
  onDelete,
  onViewProduct,
  onAddProduct,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>('');

  const products = shop.products || [];
  const productCount = getShopProductCount(shop);
  const plan = shop.subscription?.plan;
  const planName = plan?.name || shop.subscriptionUsage?.planName || 'Free Starter Plan';
  const productLimit = plan?.productLimit || shop.subscriptionUsage?.productLimit || 10;
  const usagePercentage = Math.min(100, Math.round((productCount / (productLimit || 1)) * 100));

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const term = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Shops</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span>Stores</span>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[200px]">{shop.name}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onEdit && (
            <button
              onClick={() => onEdit(shop)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Store</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(shop)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete Store</span>
            </button>
          )}

          {onToggleVerify && (
            <button
              onClick={handleActionVerify}
              disabled={isVerifying}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                shop.verified
                  ? 'bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 shadow-red-500/10'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
              }`}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : shop.verified ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{shop.verified ? 'Revoke Verification' : 'Verify Store Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-xl shadow-orange-500/25 border border-orange-400/30 shrink-0">
              {shop.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {shop.name}
                </h1>
                {shop.verified ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Verified Store
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Pending Verification
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex flex-wrap items-center gap-3">
                <span>Owned by <strong className="text-slate-200">{shop.ownerName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {shop.city}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  {shop.category}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{shop.rating ? shop.rating.toFixed(1) : '4.8'}</span>
              <span className="text-[11px] text-slate-400 font-normal ml-1">rating</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-200 text-xs font-semibold">
              <span className="text-orange-400 font-bold">{productCount}</span> Products
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Contact Phone */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/50 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Phone Contact</div>
            <a
              href={`tel:${shop.phone}`}
              className="text-sm font-bold text-white hover:text-orange-400 transition-colors truncate block"
            >
              {shop.phone}
            </a>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/50 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">WhatsApp Business</div>
            {shop.whatsapp ? (
              <a
                href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-emerald-300 hover:underline flex items-center gap-1 truncate"
              >
                <span>{shop.whatsapp}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <span className="text-xs text-slate-500">Not configured</span>
            )}
          </div>
        </div>

        {/* Subscription Plan */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/50 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Subscription</div>
            <div className="text-sm font-bold text-amber-300 truncate">{planName}</div>
          </div>
        </div>

        {/* Created Date */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/50 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered On</div>
            <div className="text-sm font-bold text-slate-200">
              {shop.createdAt
                ? new Date(shop.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Store Details + Subscription Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business & Location Info */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/60 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            Store Location & Info
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Physical Address</span>
              <p className="text-slate-200 font-medium mt-0.5 leading-relaxed">
                {shop.address || 'No physical address provided'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <span className="text-slate-400 block text-[11px]">City</span>
                <span className="text-slate-200 font-semibold">{shop.city}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Category</span>
                <span className="text-slate-200 font-semibold">{shop.category}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-slate-400 block text-[11px]">Store ID</span>
              <span className="text-slate-400 font-mono text-[10px] break-all">{shop.id}</span>
            </div>
          </div>
        </div>

        {/* Subscription Plan & Usage Progress */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-400" />
                Subscription Quota & Listing Usage
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/15 border border-orange-500/30 text-orange-300">
                {planName}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Products Listed vs Plan Limit</span>
                <span className="font-bold text-white">
                  {productCount} / {productLimit} items ({usagePercentage}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercentage >= 100
                      ? 'bg-red-500'
                      : usagePercentage > 80
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-orange-500 to-amber-400'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                {productCount >= productLimit ? (
                  <span className="text-red-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Product limit reached. Upgrade dealer subscription to allow more listings.
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    {productLimit - productCount} additional product listings available on this tier.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
            <span>Monthly Rate: <strong className="text-white font-bold">₹{plan?.price ?? 0}/mo</strong></span>
            <span>Plan Status: <strong className="text-emerald-400 font-bold">{plan?.status || 'ACTIVE'}</strong></span>
          </div>
        </div>
      </div>

      {/* Store Products Catalog */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl bg-slate-900/60">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-400" />
              Products in this Store ({filteredProducts.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any product to view its dedicated single product page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search store products..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 w-48 sm:w-60"
              />
            </div>

            {onAddProduct && (
              <button
                onClick={onAddProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
            <p className="font-semibold text-slate-300">No products found in this store</p>
            <p className="text-xs text-slate-500">
              {productSearch ? 'Try clearing your search query.' : 'This dealer has not added any products yet.'}
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const productImages = getProductImages(product);
              const thumbnail =
                productImages[0] ||
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';

              return (
                <div
                  key={product.id}
                  onClick={() => onViewProduct && onViewProduct({ ...product, shop })}
                  className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-950/60 hover:border-orange-500/40 transition-all hover:shadow-xl hover:shadow-orange-500/5 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-full h-36 rounded-xl bg-slate-900 border border-white/5 overflow-hidden flex items-center justify-center relative">
                      <img
                        src={thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                        }}
                      />
                      {product.stock <= 0 && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-md">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-orange-400 block">
                        {product.brand}
                      </span>
                      <h3 className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {product.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                    <span className="font-black text-white text-sm">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                      <span>View</span>
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
