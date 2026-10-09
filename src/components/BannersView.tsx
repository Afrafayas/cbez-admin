import React, { useState, useMemo } from 'react';
import { Banner, Shop } from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Image as ImageIcon,
  Store,
  Megaphone,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';

interface BannersViewProps {
  banners: Banner[];
  shops: Shop[];
  onOpenCreate: () => void;
  onEdit: (banner: Banner) => void;
  onDelete: (bannerId: string) => Promise<void>;
  onToggleStatus: (bannerId: string, currentStatus: boolean) => Promise<void>;
  isLoading: boolean;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const BannersView: React.FC<BannersViewProps> = ({
  banners,
  shops,
  onOpenCreate,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading,
  searchTerm = '',
  onSearchChange,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'banner' | 'ads'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Preview Modal state
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);

  // Delete Confirm Modal state
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const effectiveSearch = onSearchChange ? searchTerm : localSearch;

  // Stats calculation
  const stats = useMemo(() => {
    const total = banners.length;
    const active = banners.filter((b) => b.isActive).length;
    // Shop banners: type is 'ads' in DB or has shopId
    const shopBanners = banners.filter((b) => b.type === 'ads' || Boolean(b.shopId)).length;
    // Platform ads: type is 'banner' and no shopId
    const platformAds = banners.filter((b) => b.type === 'banner' && !b.shopId).length;
    return { total, active, shopBanners, platformAds };
  }, [banners]);

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => {
      // Type classification:
      // In DB: 'ads' or has shopId = Shop Banner ('banner')
      // In DB: 'banner' without shopId = Platform Ads ('ads')
      const isShopBanner = banner.type === 'ads' || Boolean(banner.shopId);
      const isPlatformAd = !isShopBanner;

      if (selectedTypeFilter === 'banner' && !isShopBanner) return false;
      if (selectedTypeFilter === 'ads' && !isPlatformAd) return false;

      if (statusFilter === 'active' && !banner.isActive) return false;
      if (statusFilter === 'inactive' && banner.isActive) return false;

      if (effectiveSearch.trim()) {
        const query = effectiveSearch.toLowerCase().trim();
        const titleMatch = banner.title.toLowerCase().includes(query);
        const detailsMatch = (banner.details || '').toLowerCase().includes(query);
        const shopName = banner.shop?.name || shops.find((s) => s.id === banner.shopId)?.name || '';
        const shopMatch = shopName.toLowerCase().includes(query);
        const cityMatch = (banner.shop?.city || '').toLowerCase().includes(query);

        if (!titleMatch && !detailsMatch && !shopMatch && !cityMatch) {
          return false;
        }
      }

      return true;
    });
  }, [banners, selectedTypeFilter, statusFilter, effectiveSearch, shops]);

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(bannerToDelete.id);
      setBannerToDelete(null);
    } catch (e) {
      // Error handled by parent toast
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async (banner: Banner) => {
    setTogglingId(banner.id);
    try {
      await onToggleStatus(banner.id, banner.isActive);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Banner & Ad Management</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {stats.total} Total
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage customer-facing promotional banners, shop marketing promotions, and platform deals.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner / Ad</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Promos</span>
            <Layers className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across all categories</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{stats.active}</div>
          <div className="text-[11px] text-slate-500 mt-1">Visible to customers</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Shop Banners</span>
            <Store className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{stats.shopBanners}</div>
          <div className="text-[11px] text-slate-500 mt-1">Linked to individual shops</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Platform Ads</span>
            <Megaphone className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">{stats.platformAds}</div>
          <div className="text-[11px] text-slate-500 mt-1">Platform-wide deals</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={effectiveSearch}
            onChange={(e) => {
              if (onSearchChange) onSearchChange(e.target.value);
              else setLocalSearch(e.target.value);
            }}
            placeholder="Search banners, shops, deals..."
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-white/10 text-xs font-medium">
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedTypeFilter === 'all'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedTypeFilter('banner')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedTypeFilter === 'banner'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Shop Banners</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('ads')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedTypeFilter === 'ads'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-3 h-3" />
              <span>Platform Ads</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-white/10 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-slate-800 text-slate-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Main List Table / Cards */}
      {isLoading ? (
        <div className="glass-panel p-16 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-sm font-semibold">Loading banners and ads...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">No Banners Found</h4>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
              {effectiveSearch
                ? `No banners or ads matched "${effectiveSearch}". Try adjusting your search or filters.`
                : 'No promotional banners have been created yet. Click below to add your first banner or advertisement.'}
            </p>
          </div>
          {!effectiveSearch && (
            <button
              onClick={onOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add First Banner
            </button>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-slate-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-4">Banner / Preview</th>
                  <th className="py-4 px-4">Title & Details</th>
                  <th className="py-4 px-4">Type & Scope</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredBanners.map((banner) => {
                  const isShopBanner = banner.type === 'ads' || Boolean(banner.shopId);
                  const connectedShop =
                    banner.shop || shops.find((s) => s.id === banner.shopId);

                  return (
                    <tr
                      key={banner.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Image Preview */}
                      <td className="py-3.5 px-4 w-44">
                        <div
                          onClick={() => setPreviewBanner(banner)}
                          className="relative w-36 h-20 rounded-xl overflow-hidden bg-slate-950 border border-white/10 cursor-pointer group/thumb shadow-md"
                          title="Click to view full preview"
                        >
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1511707171634-5f897ff02560';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-5 h-5 drop-shadow" />
                          </div>
                        </div>
                      </td>

                      {/* Title & Details */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-bold text-white text-base tracking-tight line-clamp-1">
                          {banner.title}
                        </div>
                        {banner.details ? (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {banner.details}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-600 italic mt-1">No description provided</p>
                        )}
                        <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-2">
                          <span>Created {new Date(banner.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Type & Scope Badge */}
                      <td className="py-3.5 px-4">
                        {isShopBanner ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                              <Store className="w-3 h-3" />
                              <span>Banner (Shop Banner)</span>
                            </span>
                            {connectedShop ? (
                              <div className="text-xs text-slate-300 flex items-center gap-1 font-semibold pl-1">
                                <span>{connectedShop.name}</span>
                                {connectedShop.city && (
                                  <span className="text-slate-500 font-normal">
                                    • {connectedShop.city}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-amber-400/80 pl-1 italic">
                                Shop ID: {banner.shopId || 'Unlinked'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              <Megaphone className="w-3 h-3" />
                              <span>Ads (Platform Deal)</span>
                            </span>
                            <div className="text-xs text-slate-400 pl-1">
                              Platform-wide offer
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={banner.isActive}
                              onChange={() => handleToggle(banner)}
                              disabled={togglingId === banner.id}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                          <span
                            className={`text-xs font-bold ${
                              banner.isActive ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            {togglingId === banner.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                            ) : banner.isActive ? (
                              'Live'
                            ) : (
                              'Paused'
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(banner)}
                            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            title="Edit Banner"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBannerToDelete(banner)}
                            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Banner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewBanner(null)}
        >
          <div
            className="glass-panel w-full max-w-3xl bg-slate-900 border border-white/15 rounded-2xl overflow-hidden shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-sm text-white">Banner Customer Preview</span>
              </div>
              <button
                onClick={() => setPreviewBanner(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[16/8] bg-slate-950 overflow-hidden">
              <img
                src={previewBanner.image}
                alt={previewBanner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <div className="space-y-1.5">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-500 text-white">
                    {previewBanner.type === 'ads' || previewBanner.shopId
                      ? `Shop: ${previewBanner.shop?.name || 'Local Partner'}`
                      : 'Special Deal'}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow">
                    {previewBanner.title}
                  </h3>
                  {previewBanner.details && (
                    <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-xl">
                      {previewBanner.details}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400">
              <div>
                Status:{' '}
                <span className={previewBanner.isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {previewBanner.isActive ? 'Live on Customer Website' : 'Currently Hidden'}
                </span>
              </div>
              <button
                onClick={() => {
                  const b = previewBanner;
                  setPreviewBanner(null);
                  onEdit(b);
                }}
                className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer transition-colors"
              >
                Edit Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="text-lg font-bold text-white">Delete Banner?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete <span className="text-white font-semibold">"{bannerToDelete.title}"</span>? This will remove it from the customer homepage carousel immediately.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBannerToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
