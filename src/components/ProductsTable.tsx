import React, { useState, useEffect } from 'react';
import { Product, Shop } from '../types';
import { ShoppingBag, Eye, Trash2, Tag, Layers, Store, CheckCircle2, AlertTriangle, Search, Filter, Box } from 'lucide-react';
import { Pagination } from './Pagination';

interface ProductsTableProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onDelete: (product: Product) => void;
  onViewShop?: (shop: Shop) => void;
  searchTerm: string;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onViewDetails,
  onDelete,
  onViewShop,
  searchTerm,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (selectedBrand !== 'all' && product.brand !== selectedBrand) return false;

    if (selectedStockStatus === 'in_stock' && product.stock <= 0) return false;
    if (selectedStockStatus === 'low_stock' && (product.stock <= 0 || product.stock > 5)) return false;
    if (selectedStockStatus === 'out_of_stock' && product.stock > 0) return false;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchName = product.name.toLowerCase().includes(term);
      const matchBrand = product.brand.toLowerCase().includes(term);
      const matchCategory = product.category.toLowerCase().includes(term);
      const matchShop = product.shop?.name.toLowerCase().includes(term) ?? false;
      const matchDesc = product.description.toLowerCase().includes(term);
      return matchName || matchBrand || matchCategory || matchShop || matchDesc;
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, selectedStockStatus, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Directory Controls Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Products Directory
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {filteredProducts.length} Items
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse and inspect product listings across all registered stores, check stock levels, and remove invalid items.
          </p>
        </div>

        {/* Filters & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stock Status Buttons */}
          <div className="flex p-1 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedStockStatus('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedStockStatus === 'all'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setSelectedStockStatus('in_stock')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedStockStatus === 'in_stock'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              In Stock ({products.filter((p) => p.stock > 0).length})
            </button>
            <button
              onClick={() => setSelectedStockStatus('out_of_stock')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedStockStatus === 'out_of_stock'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Out of Stock ({products.filter((p) => p.stock <= 0).length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
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
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-xl glass-input text-slate-300"
            >
              <option value="all" className="bg-slate-900">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b} className="bg-slate-900">{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="block md:hidden p-4 space-y-3">
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <ShoppingBag className="w-8 h-8 text-slate-500 opacity-60 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No products found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          paginatedProducts.map((product) => {
            const thumbnail = product.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';

            return (
              <div
                key={product.id}
                className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 space-y-3 hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-950 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm line-clamp-1">{product.name}</div>
                    <div className="text-xs text-orange-400 font-semibold mt-0.5 flex items-center gap-2">
                      <span>{product.brand}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-normal">{product.category}</span>
                    </div>
                    <div className="text-sm font-black text-white mt-1">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Store className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="truncate">{product.shop?.name || 'Store N/A'}</span>
                  </div>
                  <div className="flex items-center justify-end">
                    {product.stock > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {product.stock} in stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                        Out of stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => onViewDetails(product)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/5 transition-colors cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-white/10">
            <tr>
              <th className="px-5 py-3.5">Product Info</th>
              <th className="px-5 py-3.5">Category & Brand</th>
              <th className="px-5 py-3.5">Store / Seller</th>
              <th className="px-5 py-3.5 text-right">Price</th>
              <th className="px-5 py-3.5 text-center">Stock Level</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShoppingBag className="w-8 h-8 text-slate-500 opacity-60" />
                    <p className="font-semibold text-slate-300">No products found</p>
                    <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => {
                const thumbnail = product.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';

                return (
                  <tr key={product.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* Product Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={thumbnail}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                            }}
                          />
                        </div>
                        <div className="min-w-0 max-w-[280px]">
                          <div className="font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-slate-400 truncate mt-0.5" title={product.description}>
                            {product.description || 'No description available'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Brand */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-orange-400 text-xs">{product.brand}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{product.category}</div>
                    </td>

                    {/* Store / Seller */}
                    <td className="px-5 py-4">
                      {product.shop ? (
                        <div>
                          <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            {product.shop.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {product.shop.city || product.shop.ownerName || 'Verified Store'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic">Store info unavailable</div>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 text-right">
                      <div className="font-black text-white text-sm">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Stock Level */}
                    <td className="px-5 py-4 text-center">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {product.stock} in stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Out of Stock
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDetails(product)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors cursor-pointer"
                          title="View Product Specs & Images"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Product Listing"
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
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="products"
      />
    </div>
  );
};
