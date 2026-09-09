import React from 'react';
import { Shop } from '../types';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteShopModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteShopModal: React.FC<DeleteShopModalProps> = ({
  shop,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !shop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/20 overflow-hidden shadow-2xl bg-slate-900/90">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4 shadow-lg shadow-red-500/10">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">Delete Store Listing?</h3>
          <p className="text-xs text-slate-400 mb-4">
            Are you sure you want to delete <span className="font-semibold text-white">"{shop.name}"</span>?
            This will permanently remove the store profile, products, and associated leads from the platform.
          </p>

          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] mb-6 font-medium text-left">
            ⚠️ Warning: This action cannot be undone.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isLoading ? 'Deleting...' : 'Delete Store'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
