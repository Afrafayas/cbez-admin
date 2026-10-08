import React, { useState, useEffect } from 'react';
import { Shop, Product, getShopProductCount } from '../types';
import { ShieldCheck, ShieldAlert, Edit2, Trash2, Eye, Phone, MessageSquare, MapPin, Tag, Star, CreditCard, Plus, Clock, AlertCircle } from 'lucide-react';
import { Pagination } from './Pagination';

export function getSubscriptionExpiryInfo(shop: Shop) {
  const sub = shop.subscription;
  const plan = sub?.plan;
  const durationDays = plan?.durationDays || shop.subscriptionUsage?.durationDays || 30;

  let startDate: Date;
  if (sub?.startDate) {
    startDate = new Date(sub.startDate);
  } else if (shop.subscriptionUsage?.startDate) {
    startDate = new Date(shop.subscriptionUsage.startDate);
  } else if (sub?.createdAt) {
    startDate = new Date(sub.createdAt);
  } else if (shop.createdAt) {
    startDate = new Date(shop.createdAt);
  } else {
    startDate = new Date();
  }

  let endDate: Date;
  if (sub?.endDate) {
    endDate = new Date(sub.endDate);
  } else if (shop.subscriptionUsage?.endDate) {
    endDate = new Date(shop.subscriptionUsage.endDate);
  } else {
    endDate = new Date(startDate.getTime() + durationDays * 86400000);
  }

  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  const isExpired = sub?.status === 'EXPIRED' || shop.isSubscriptionExpired || shop.subscriptionUsage?.isExpired || diffDays <= 0;
  const isWarning = diffDays <= 5;

  const formattedDate = endDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    endDate,
    formattedDate,
    diffDays,
    isExpired,
    isWarning,
  };
}

interface ShopsTableProps {
  onOpenCreateShop?: () => void;
  shops: Shop[];
  products?: Product[];
  onToggleVerify?: (id: string, currentStatus: boolean, shop?: Shop) => void;
  onEdit: (shop: Shop) => void;
  onChangeSubscription?: (shop: Shop) => void;
  onDelete: (shop: Shop) => void;
  onViewDetails: (shop: Shop) => void;
  filterStatus: 'all' | 'verified' | 'pending';
  setFilterStatus: (status: 'all' | 'verified' | 'pending') => void;
  searchTerm: string;
}

export const ShopsTable: React.FC<ShopsTableProps> = ({
  onOpenCreateShop,
  shops,
  products,
  onToggleVerify,
  onEdit,
  onChangeSubscription,
  onDelete,
  onViewDetails,
  filterStatus,
  setFilterStatus,
  searchTerm,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<string>('all');
  const [selectedExpiryFilter, setSelectedExpiryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const cities = Array.from(new Set(shops.map((s) => s.city).filter(Boolean)));
  const categories = Array.from(new Set(shops.map((s) => s.category).filter(Boolean)));
  const subscriptionPlans = Array.from(
    new Set(shops.map((s) => s.subscription?.plan?.name || 'Free Starter Plan').filter(Boolean))
  );

  const filteredShops = shops.filter((shop) => {
    if (filterStatus === 'verified' && !shop.verified) return false;
    if (filterStatus === 'pending' && shop.verified) return false;
    if (selectedCity !== 'all' && shop.city !== selectedCity) return false;
    if (selectedCategory !== 'all' && shop.category !== selectedCategory) return false;
    if (selectedSubscriptionPlan !== 'all') {
      const planName = shop.subscription?.plan?.name || 'Free Starter Plan';
      if (planName !== selectedSubscriptionPlan) return false;
    }

    if (selectedExpiryFilter !== 'all') {
      const exp = getSubscriptionExpiryInfo(shop);
      if (selectedExpiryFilter === 'expiring_5d') {
        if (exp.diffDays > 5) return false;
      } else if (selectedExpiryFilter === 'expiring_10d') {
        if (exp.diffDays > 10) return false;
      } else if (selectedExpiryFilter === 'expired') {
        if (!exp.isExpired) return false;
      } else if (selectedExpiryFilter === 'active') {
        if (exp.isExpired || exp.diffDays <= 5) return false;
      }
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchName = shop.name.toLowerCase().includes(term);
      const matchOwner = shop.ownerName.toLowerCase().includes(term);
      const matchCity = shop.city.toLowerCase().includes(term);
      const matchCategory = shop.category.toLowerCase().includes(term);
      const matchPhone = shop.phone.toLowerCase().includes(term);
      return matchName || matchOwner || matchCity || matchCategory || matchPhone;
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, selectedCity, selectedCategory, selectedSubscriptionPlan, selectedExpiryFilter, searchTerm]);

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div id="shops-table-section" className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            User Shops Directory
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {filteredShops.length} Stores
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage seller shop profiles, inspect subscription validity & expirations, edit store details, or remove store listings.
          </p>
        </div>

        {/* Filter Controls & Create Shop Button */}
        <div className="flex flex-wrap items-center gap-2.5">


          <div className="flex p-1 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold overflow-x-auto max-w-full">
            <button
              onClick={() => {
                setFilterStatus('all');
                if (selectedExpiryFilter === 'expiring_5d') setSelectedExpiryFilter('all');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${filterStatus === 'all' && selectedExpiryFilter === 'all'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              All ({shops.length})
            </button>
            <button
              onClick={() => {
                setFilterStatus('verified');
                if (selectedExpiryFilter === 'expiring_5d') setSelectedExpiryFilter('all');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${filterStatus === 'verified' && selectedExpiryFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Verified ({shops.filter((s) => s.verified).length})
            </button>
            <button
              onClick={() => {
                setFilterStatus('pending');
                if (selectedExpiryFilter === 'expiring_5d') setSelectedExpiryFilter('all');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${filterStatus === 'pending' && selectedExpiryFilter === 'all'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Pending ({shops.filter((s) => !s.verified).length})
            </button>
            <button
              onClick={() => {
                setSelectedExpiryFilter(selectedExpiryFilter === 'expiring_5d' ? 'all' : 'expiring_5d');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${selectedExpiryFilter === 'expiring_5d'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/25 font-bold'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                }`}
              title="Filter stores with 5 days or less remaining"
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 ${shops.some((s) => getSubscriptionExpiryInfo(s).diffDays <= 5) ? 'animate-ping' : ''}`} />
              <span>Expiring Soon ({shops.filter((s) => getSubscriptionExpiryInfo(s).diffDays <= 5).length})</span>
            </button>
          </div>

          {onOpenCreateShop && (
            <button
              onClick={onOpenCreateShop}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Register New Store
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-xl glass-input text-slate-300"
            >
              <option value="all" className="bg-slate-900">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city} className="bg-slate-900">{city}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-xl glass-input text-slate-300"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
              ))}
            </select>

            <select
              value={selectedSubscriptionPlan}
              onChange={(e) => setSelectedSubscriptionPlan(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-xl glass-input text-slate-300"
            >
              <option value="all" className="bg-slate-900">All Subscription Plans</option>
              {subscriptionPlans.map((plan) => (
                <option key={plan} value={plan} className="bg-slate-900">{plan}</option>
              ))}
            </select>

            <select
              value={selectedExpiryFilter}
              onChange={(e) => setSelectedExpiryFilter(e.target.value)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-xl glass-input cursor-pointer font-medium ${
                selectedExpiryFilter !== 'all' ? 'text-red-400 border-red-500/40 bg-red-500/10 font-bold' : 'text-slate-300'
              }`}
            >
              <option value="all" className="bg-slate-900 text-slate-300">All Expiry Status</option>
              <option value="expiring_5d" className="bg-slate-900 text-red-400 font-semibold">⚠️ Expiring Soon (≤ 5 Days)</option>
              <option value="expiring_10d" className="bg-slate-900 text-amber-400">⏳ Expiring Soon (≤ 10 Days)</option>
              <option value="expired" className="bg-slate-900 text-red-400">⛔ Already Expired</option>
              <option value="active" className="bg-slate-900 text-emerald-400">✅ Active (&gt; 5 Days)</option>
            </select>

            {(selectedCity !== 'all' || selectedCategory !== 'all' || selectedSubscriptionPlan !== 'all' || selectedExpiryFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCity('all');
                  setSelectedCategory('all');
                  setSelectedSubscriptionPlan('all');
                  setSelectedExpiryFilter('all');
                }}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Reset all filters"
              >
                Reset Filters
              </button>
            )}
          </div>


        </div>
      </div>

      {/* Mobile Card List View (visible < md) */}
      <div className="block md:hidden p-4 space-y-3">
        {paginatedShops.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <ShieldAlert className="w-8 h-8 text-slate-500 opacity-60 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No shops found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          paginatedShops.map((shop) => {
            const productCount = getShopProductCount(shop, products);
            const planName = shop.subscription?.plan?.name || 'Free Starter Plan';
            const expiryInfo = getSubscriptionExpiryInfo(shop);

            return (
              <div
                key={shop.id}
                className={`p-4 rounded-2xl glass-panel space-y-3 transition-all ${!shop.verified
                    ? 'border-l-4 border-l-amber-500 border-white/10 bg-amber-500/[0.03] shadow-lg'
                    : 'border border-white/10 bg-slate-900/60 hover:border-orange-500/30'
                  }`}
              >
                {/* Header: Name & Verified Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onViewDetails(shop)}
                      className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0 hover:scale-105 hover:bg-orange-500/25 transition-all cursor-pointer"
                      title="View Store Details"
                    >
                      {shop.name.charAt(0).toUpperCase()}
                    </button>
                    <div>
                      <button
                        type="button"
                        onClick={() => onViewDetails(shop)}
                        className="font-bold text-white hover:text-orange-400 text-sm flex items-center gap-1.5 transition-colors text-left cursor-pointer group"
                      >
                        <span className="group-hover:underline">{shop.name}</span>
                        {shop.verified ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pending Audit
                          </span>
                        )}
                      </button>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{shop.ownerName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="truncate">{shop.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{shop.category}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate">{shop.phone}</span>
                    </div>
                    {shop.whatsapp && (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{shop.whatsapp}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 text-slate-300 col-span-2 sm:col-span-1 pt-1 sm:pt-0">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                      <span className="truncate text-indigo-300 font-medium">{planName}</span>
                    </div>
                    {/* Expiration date & days left */}
                    <div className={`text-[10px] flex items-center gap-1.5 pl-5 ${expiryInfo.isWarning ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                      {expiryInfo.isWarning ? (
                        <AlertCircle className="w-3 h-3 text-red-400 shrink-0 animate-pulse" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                      <span className={expiryInfo.isWarning ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {expiryInfo.isExpired ? 'Expired:' : 'Expires:'} {expiryInfo.formattedDate}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] ${expiryInfo.isWarning ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30' : 'text-slate-400'}`}>
                        {expiryInfo.isExpired
                          ? 'Expired'
                          : expiryInfo.diffDays === 1
                          ? '1d left'
                          : `${expiryInfo.diffDays}d left`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Products, Rating & Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-200 whitespace-nowrap shrink-0">
                      {productCount} {productCount === 1 ? 'Item' : 'Items'}
                    </span>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {shop.rating ? shop.rating.toFixed(1) : '4.5'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!shop.verified ? (
                      <button
                        onClick={() => onViewDetails(shop)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer border border-amber-400/50 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review & Verify</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onViewDetails(shop)}
                        className="p-2 rounded-xl text-slate-300 hover:text-orange-300 bg-slate-800/80 hover:bg-orange-500/20 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(shop)}
                      className="p-2 rounded-xl text-slate-300 hover:text-amber-300 bg-slate-800/80 hover:bg-amber-500/20 transition-colors cursor-pointer"
                      title="Edit Shop"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(shop)}
                      className="p-2 rounded-xl text-slate-300 hover:text-red-400 bg-slate-800/80 hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="Delete Shop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (visible >= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-white/10">
            <tr>
              <th className="px-5 py-3.5">Store Details</th>
              <th className="px-5 py-3.5">Owner & Contact</th>
              <th className="px-5 py-3.5">Location & Category</th>
              <th className="px-5 py-3.5">Subscription Plan</th>
              <th className="px-5 py-3.5">Plan Expiry</th>
              <th className="px-5 py-3.5">Products</th>
              <th className="px-5 py-3.5 text-center">Rating</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedShops.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-500 opacity-60" />
                    <p className="font-semibold text-slate-300">No stores found</p>
                    <p className="text-xs text-slate-500">Try changing your search term or filter status.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedShops.map((shop) => {
                const productCount = getShopProductCount(shop, products);
                const planName = shop.subscription?.plan?.name || 'Free Starter Plan';
                const expiryInfo = getSubscriptionExpiryInfo(shop);

                return (
                  <tr
                    key={shop.id}
                    className={`transition-colors ${!shop.verified
                        ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08] border-l-2 border-l-amber-500/80'
                        : 'hover:bg-white/5'
                      }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onViewDetails(shop)}
                          className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-base shrink-0 hover:scale-105 hover:bg-orange-500/25 transition-all cursor-pointer"
                          title="View Store Details"
                        >
                          {shop.name.charAt(0).toUpperCase()}
                        </button>
                        <div>
                          <button
                            type="button"
                            onClick={() => onViewDetails(shop)}
                            className="font-semibold text-white hover:text-orange-400 flex items-center gap-1.5 transition-colors text-left cursor-pointer group"
                          >
                            <span className="group-hover:underline">{shop.name}</span>
                            {shop.verified ? (
                              <span title="Verified Store">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                                Pending
                              </span>
                            )}
                          </button>
                          <div className="text-xs text-slate-400 truncate max-w-[200px]" title={shop.address}>
                            {shop.address || 'No physical address provided'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-slate-200 font-medium text-xs mb-1">{shop.ownerName}</div>
                      <div className="flex flex-col gap-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                          <Phone className="w-3 h-3 text-orange-400 shrink-0" />
                          <span>{shop.phone}</span>
                        </span>
                        {shop.whatsapp && (
                          <span className="flex items-center gap-1.5 text-emerald-400/90 hover:text-emerald-300 transition-colors">
                            <MessageSquare className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{shop.whatsapp}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        {shop.city}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        {shop.category}
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-200 font-semibold text-xs shadow-sm">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{planName}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {/* Expiring Date */}
                        <div className={`text-xs flex items-center gap-1.5 ${expiryInfo.isWarning ? 'text-red-400 font-bold' : 'text-slate-200 font-medium'}`}>
                          {expiryInfo.isWarning ? (
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 animate-pulse" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>{expiryInfo.formattedDate}</span>
                        </div>

                        {/* Days Left below date */}
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              expiryInfo.isWarning
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                                : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                            }`}
                          >
                            {expiryInfo.isExpired ? (
                              <span>
                                {expiryInfo.diffDays === 0
                                  ? 'Expired today'
                                  : `Expired ${Math.abs(expiryInfo.diffDays)} ${Math.abs(expiryInfo.diffDays) === 1 ? 'day' : 'days'} ago`}
                              </span>
                            ) : (
                              <span>
                                {expiryInfo.diffDays === 1
                                  ? '1 day left'
                                  : `${expiryInfo.diffDays} days left`}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 whitespace-nowrap shrink-0">
                        {productCount} {productCount === 1 ? 'Item' : 'Items'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {shop.rating ? shop.rating.toFixed(1) : '4.5'}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!shop.verified ? (
                          <button
                            onClick={() => onViewDetails(shop)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer border border-amber-400/50 transition-all"
                            title="Review store details & verify"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review & Verify</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewDetails(shop)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors cursor-pointer"
                            title="View Store Products & Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {onChangeSubscription && (
                          <button
                            onClick={() => onChangeSubscription(shop)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-colors cursor-pointer"
                            title="Change Subscription Plan"
                          >
                            <CreditCard className="w-4 h-4 text-orange-400" />
                          </button>
                        )}

                        <button
                          onClick={() => onEdit(shop)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Edit Shop Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(shop)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Shop Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredShops.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="shops"
      />
    </div>
  );
};
