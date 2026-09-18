import React, { useState } from 'react';
import { Category, Product } from '../types';
import {
  ArrowLeft,
  Layers,
  ShoppingBag,
  Edit,
  Trash2,
  Plus,
  Search,
  Image as ImageIcon,
  Calendar,
  Hash,
  Eye,
  Sliders,
  Store,
} from 'lucide-react';

interface SingleCategoryViewProps {
  category: Category;
  products: Product[];
  onBack: () => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onViewProduct?: (product: Product) => void;
  onAddProduct?: () => void;
}

export const SingleCategoryView: React.FC<SingleCategoryViewProps> = ({
  category,
  products,
  onBack,
  onEdit,
  onDelete,
  onViewProduct,
  onAddProduct,
}) => {
  const [productSearch, setProductSearch] = useState('');

  const categoryProducts = products.filter(
    (p) =>
      p.category?.toLowerCase() === category.name.toLowerCase() ||
      (category.slug && p.category?.toLowerCase() === category.slug.toLowerCase())
  );

  const filteredProducts = categoryProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.shop?.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const specRules = category.specConfig || [];

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
            <span>Back to Categories</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span>Categories & Brands</span>
            <span>/</span>
            <span>Categories</span>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[200px]">{category.name}</span>
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
              onClick={() => onEdit(category)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Category</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(category)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Hero Overview Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Category Image Box */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-slate-600" />
            )}
          </div>

          {/* Details & Metadata */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Category Master
              </span>
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-amber-300">
                slug: {category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" />
                {categoryProducts.length} {categoryProducts.length === 1 ? 'Product' : 'Products'} Listed
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {category.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 pt-1 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>ID: <span className="font-mono text-slate-300">{category.id}</span></span>
              </div>
              {category.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Created: {new Date(category.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                </div>
              )}
              {specRules.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-300 font-medium">{specRules.length} Spec Rules Configured</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Specification Configuration Rules */}
      {specRules.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Dynamic Specification Rules ({specRules.length})</h3>
                <p className="text-xs text-slate-400">Configured attributes for product listings under this category</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {specRules.map((rule, idx) => (
              <div
                key={rule.key || idx}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 hover:border-orange-500/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{rule.label || rule.key}</span>
                  <div className="flex items-center gap-1.5">
                    {rule.required && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                        Required
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5 font-mono uppercase">
                      {rule.type}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-500">Key:</span>{' '}
                    <span className="font-mono text-slate-300">{rule.key}</span>
                  </div>
                  {rule.options && (
                    <div className="truncate">
                      <span className="text-slate-500">Options:</span>{' '}
                      <span className="text-amber-300/90 font-mono text-[10px]">{rule.options}</span>
                    </div>
                  )}
                  {rule.placeholder && (
                    <div className="truncate text-slate-500 italic">
                      "{rule.placeholder}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Associated Products Directory */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Associated Products Catalog</h3>
              <p className="text-xs text-slate-400">
                Products currently categorized under {category.name} ({categoryProducts.length} total)
              </p>
            </div>
          </div>

          {/* Search within this category */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search in this category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-white/5">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs">
              {categoryProducts.length === 0
                ? 'No products currently cataloged under this category.'
                : 'No products match your search filter.'}
            </p>
            {onAddProduct && categoryProducts.length === 0 && (
              <button
                onClick={onAddProduct}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Brand</th>
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
                            <div className="text-[10px] text-slate-500 font-mono">ID: {p.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300 text-[11px] font-medium">
                          {p.brand || 'Unbranded'}
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
