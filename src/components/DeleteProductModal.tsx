import React from 'react';
import { Product } from '../types';
import { AlertTriangle, Loader2 } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden bg-slate-900/90 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Delete Product Listing</h3>
            <p className="text-xs text-slate-400">This action will remove the item from the catalog</p>
          </div>
        </div>

        <p className="text-sm text-slate-300">
          Are you sure you want to delete product listing{' '}
          <strong className="text-white font-bold">{product.name}</strong> (
          <span className="text-orange-400 font-semibold">{product.brand}</span>)?
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
