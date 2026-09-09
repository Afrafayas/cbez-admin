import React, { useState } from 'react';
import { Shop } from '../types';
import { ShieldCheck, ShieldAlert, Edit2, Trash2, Eye, Phone, MessageSquare, MapPin, Tag, Star } from 'lucide-react';

interface ShopsTableProps {
  shops: Shop[];
  onToggleVerify: (id: string, currentStatus: boolean) => void;
  onEdit: (shop: Shop) => void;
  onDelete: (shop: Shop) => void;
  onViewDetails: (shop: Shop) => void;
  filterStatus: 'all' | 'verified' | 'pending';
  setFilterStatus: (status: 'all' | 'verified' | 'pending') => void;
  searchTerm: string;
}

export const ShopsTable: React.FC<ShopsTableProps> = ({
  shops,
  onToggleVerify,
  onEdit,
  onDelete,
  onViewDetails,
  filterStatus,
  setFilterStatus,
  searchTerm,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const cities = Array.from(new Set(shops.map((s) => s.city).filter(Boolean)));
  const categories = Array.from(new Set(shops.map((s) => s.category).filter(Boolean)));

  const filteredShops = shops.filter((shop) => {
    if (filterStatus === 'verified' && !shop.verified) return false;
    if (filterStatus === 'pending' && shop.verified) return false;
    if (selectedCity !== 'all' && shop.city !== selectedCity) return false;
    if (selectedCategory !== 'all' && shop.category !== selectedCategory) return false;

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

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            User Shops Directory
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {filteredShops.length} Stores
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage seller shop profiles, toggle verified status, edit store details, or remove store listings.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({shops.length})
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'verified'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Verified ({shops.filter((s) => s.verified).length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({shops.filter((s) => !s.verified).length})
            </button>
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl glass-input text-slate-300"
          >
            <option value="all" className="bg-slate-900">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city} className="bg-slate-900">{city}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl glass-input text-slate-300"
          >
            <option value="all" className="bg-slate-900">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Data View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-white/10">
            <tr>
              <th className="px-5 py-3.5">Store Details</th>
              <th className="px-5 py-3.5">Owner & Contact</th>
              <th className="px-5 py-3.5">Location & Category</th>
              <th className="px-5 py-3.5">Products</th>
              <th className="px-5 py-3.5 text-center">Verified Status</th>
              <th className="px-5 py-3.5 text-center">Rating</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredShops.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-500 opacity-60" />
                    <p className="font-semibold text-slate-300">No shops found</p>
                    <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredShops.map((shop) => {
                const productCount = shop.products?.length ?? shop._count?.products ?? 0;

                return (
                  <tr key={shop.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0">
                          {shop.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                            {shop.name}
                            {shop.verified && (
                              <span title="Verified Store">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate max-w-[200px]" title={shop.address}>
                            {shop.address || 'No physical address provided'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-slate-200 font-medium text-xs">{shop.ownerName}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-orange-400" />
                          {shop.phone}
                        </span>
                        {shop.whatsapp && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <MessageSquare className="w-3 h-3" />
                            {shop.whatsapp}
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

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-white/10 text-slate-200">
                        {productCount} Items
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => onToggleVerify(shop.id, shop.verified)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            shop.verified ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                          title={shop.verified ? 'Click to Unverify Shop' : 'Click to Verify Shop'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              shop.verified ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            shop.verified ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {shop.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {shop.rating ? shop.rating.toFixed(1) : '4.5'}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDetails(shop)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors cursor-pointer"
                          title="View Store Products & Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

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
    </div>
  );
};
