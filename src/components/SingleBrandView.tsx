import React, { useState } from 'react';
import { Brand, Product } from '../types';
import {
  ArrowLeft,
  Bookmark,
  ShoppingBag,
  Edit,
  Trash2,
  Plus,
  Search,
  Calendar,
  Hash,
  Eye,
  Store,
  Tag,
  TrendingUp,
} from 'lucide-react';

interface SingleBrandViewProps {
  brand: Brand;
  products: Product[];
  onBack: () => void;
  onEdit?: (brand: Brand) => void;
  onDelete?: (brand: Brand) => void;
  onViewProduct?: (product: Product) => void;
  onAddProduct?: () => void;
}

export const SingleBrandView: React.FC<SingleBrandViewProps> = ({
  brand,
  products,
  onBack,
  onEdit,
  onDelete,
  onViewProduct,
  onAddProduct,
}) => {
  const [productSearch, setProductSearch] = useState('');

  const brandProducts = products.filter(
    (p) => p.brand?.toLowerCase() === brand.name.toLowerCase()
  );

  const filteredProducts = brandProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.shop?.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Distinct categories carrying this brand
  const distinctCategories = Array.from(
    new Set(brandProducts.map((p) => p.category).filter(Boolean))
  );

  // Distinct shops carrying this brand
  const distinctShops = Array.from(
    new Set(brandProducts.map((p) => p.shop?.name).filter(Boolean))
  );

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
            <span>Back to Brands</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span>Categories & Brands</span>
            <span>/</span>
            <span>Brands</span>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[200px]">{brand.name}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onAddProduct && (
            <button
              onClick={onAddProduct}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(brand)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Brand</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(brand)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Brand Hero Overview Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Brand Logo Box */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center p-3 overflow-hidden shrink-0 shadow-inner group">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Bookmark className="w-10 h-10 text-orange-400" />
            )}
          </div>

          {/* Details & Metadata */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" />
                Brand Manufacturer
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" />
                {brandProducts.length} {brandProducts.length === 1 ? 'Product' : 'Products'} Listed
              </span>
              {distinctShops.length > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  Carried by {distinctShops.length} {distinctShops.length === 1 ? 'Shop' : 'Shops'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {brand.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 pt-1 border-t border-white/5">
              {brand.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Created: {new Date(brand.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                </div>
              )}
              {distinctCategories.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>Categories: <span className="text-slate-200">{distinctCategories.join(', ')}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Associated Products Directory */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Products by {brand.name}</h3>
              <p className="text-xs text-slate-400">
                All catalog items manufactured by {brand.name} ({brandProducts.length} total)
              </p>
            </div>
          </div>

          {/* Search within this brand */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products by this brand..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-white/5">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs">
              {brandProducts.length === 0
                ? `No products currently registered under ${brand.name}.`
                : 'No products match your search filter.'}
            </p>
            {onAddProduct && brandProducts.length === 0 && (
              <button
                onClick={onAddProduct}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product for {brand.name}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Seller Shop</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredProducts.map((p) => {
                  const thumb = p.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb}
                            alt={p.name}
                            className="w-9 h-9 rounded-xl object-cover bg-slate-950 border border-white/10 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                            }}
                          />
                          <div>
                            <div className="font-bold text-white text-xs line-clamp-1">{p.name}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-amber-300 text-[11px] font-medium">
                          {p.category || 'General'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Store className="w-3.5 h-3.5 text-orange-400" />
                          <span className="truncate max-w-[140px]">{p.shop?.name || 'Assigned Dealer'}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-emerald-400 text-xs">
                        ₹{p.price?.toLocaleString('en-IN') ?? '0'}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock > 0
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        {onViewProduct && (
                          <button
                            onClick={() => onViewProduct(p)}
                            title="View Product Details"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium"
                          >
                            <Eye className="w-3.5 h-3.5 text-orange-400" />
                            <span>View</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
