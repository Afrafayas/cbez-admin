import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
  itemLabel = 'items',
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array with ellipsis if needed
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="px-4 py-3.5 border-t border-white/10 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      {/* Items per page & info text */}
      <div className="flex flex-wrap items-center gap-3 text-slate-400">
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-200 focus:outline-none focus:border-orange-500/50 cursor-pointer"
          >
            {itemsPerPageOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-slate-200">
                {opt}
              </option>
            ))}
          </select>
          <span>per page</span>
        </div>

        <span className="hidden sm:inline text-slate-600">•</span>

        <div>
          Showing <span className="font-semibold text-white">{startItem}</span> to{' '}
          <span className="font-semibold text-white">{endItem}</span> of{' '}
          <span className="font-semibold text-white">{totalItems}</span> {itemLabel}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-500 font-mono">
                  ...
                </span>
              );
            }
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[28px] h-7 px-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                  currentPage === p
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 border border-orange-400/30'
                    : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
