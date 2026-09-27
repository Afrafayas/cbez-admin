import React, { useState } from 'react';
import { Transaction, TransactionFilter, Shop } from '../types';
import {
  Search,
  Filter,
  DollarSign,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Store,
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  X,
  Phone,
} from 'lucide-react';
import { Pagination } from './Pagination';

interface TransactionsTableProps {
  transactions: Transaction[];
  totalTransactions: number;
  totalRevenue: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFilterChange: (filter: TransactionFilter) => void;
  onDeleteTransaction?: (id: string) => Promise<void>;
  onViewShop?: (shop: Shop) => void;
  isLoading?: boolean;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  totalTransactions,
  totalRevenue,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onFilterChange,
  onDeleteTransaction,
  onViewShop,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onFilterChange({
      search: val,
      paymentStatus: selectedStatus,
      type: selectedType,
      page: 1,
    });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onFilterChange({
      search: searchTerm,
      paymentStatus: status,
      type: selectedType,
      page: 1,
    });
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    onFilterChange({
      search: searchTerm,
      paymentStatus: selectedStatus,
      type,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedType('all');
    onFilterChange({
      search: '',
      paymentStatus: 'all',
      type: 'all',
      page: 1,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId || !onDeleteTransaction) return;
    try {
      setIsDeleting(true);
      await onDeleteTransaction(deletingId);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getValidUntilDate = (createdAtStr: string) => {
    try {
      const d = new Date(createdAtStr);
      d.setFullYear(d.getFullYear() + 1);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '1 Year';
    }
  };

  const isSubscriptionActive = (createdAtStr: string) => {
    try {
      const d = new Date(createdAtStr);
      d.setFullYear(d.getFullYear() + 1);
      return new Date() <= d;
    } catch {
      return true;
    }
  };

  const initialCount = transactions.filter((t) => t.type === 'INITIAL_VERIFICATION').length;
  const planChangeCount = transactions.filter((t) => t.type === 'PLAN_CHANGE').length;

  return (
    <div className="space-y-6">
      {/* Header & Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Revenue Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-slate-900/80 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-300" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Total Revenue
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Calculated from verified shop transactions</p>
        </div>

        {/* Total Transactions Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 via-slate-900/60 to-slate-900/80 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-300" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4" /> Total Transactions
            </span>
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {totalTransactions}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total recorded billing entries</p>
        </div>

        {/* Initial Verifications Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-slate-900/60 to-slate-900/80 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Verifications
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {initialCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">First-time shop verification payments</p>
        </div>

        {/* Plan Upgrades/Changes Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-slate-900/60 to-slate-900/80 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4" /> Plan Upgrades
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {planChangeCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Subscription plan changes & upgrades</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions by Shop name, Owner name, or Plan..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-slate-900/80 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Status</option>
              <option value="COMPLETED" className="bg-slate-900 text-emerald-400">Completed</option>
              <option value="PENDING" className="bg-slate-900 text-amber-400">Pending</option>
              <option value="FAILED" className="bg-slate-900 text-red-400">Failed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Types</option>
              <option value="INITIAL_VERIFICATION" className="bg-slate-900 text-emerald-400">Initial Verification</option>
              <option value="PLAN_CHANGE" className="bg-slate-900 text-purple-400">Plan Change / Upgrade</option>
              <option value="RENEWAL" className="bg-slate-900 text-blue-400">Renewal</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedStatus !== 'all' || selectedType !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Dealer Details</th>
                <th className="px-5 py-4 font-semibold">Subscription Name</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Valid Date</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading transaction logs...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt className="w-10 h-10 text-slate-600 mb-1" />
                      <span className="font-semibold text-white text-base">No transactions found</span>
                      <span className="text-xs text-slate-500">
                        Try adjusting your search terms or filters
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const shopName = tx.shop?.name || 'Unknown Shop';
                  const ownerName = tx.shop?.ownerName || 'Unknown Owner';
                  const profileImg = tx.shop?.profileImage;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/[0.03] transition-colors group border-b border-white/[0.03]"
                    >
                      {/* Date */}
                      <td className="px-5 py-4 text-xs font-semibold text-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-orange-400" />
                          <span>{formatDate(tx.createdAt)}</span>
                        </div>
                      </td>

                      {/* Dealer Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {profileImg ? (
                            <img
                              src={profileImg}
                              alt={shopName}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                              <Store className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div
                              onClick={() => tx.shop && onViewShop && onViewShop(tx.shop as Shop)}
                              className={`font-bold text-white tracking-tight truncate ${
                                tx.shop && onViewShop ? 'hover:text-orange-400 cursor-pointer' : ''
                              }`}
                            >
                              {shopName}
                            </div>
                            <div className="text-xs text-slate-400 truncate">Owner: {ownerName}</div>
                            {tx.shop?.phone && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" /> {tx.shop.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subscription Name */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-orange-400" />
                            {tx.planName || tx.plan?.name || 'Starter Plan'}
                          </span>
                          {tx.type === 'INITIAL_VERIFICATION' ? (
                            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Initial Verification
                            </div>
                          ) : tx.type === 'PLAN_CHANGE' ? (
                            <div className="text-[10px] text-purple-400 font-semibold flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3" /> Plan Upgrade
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-black text-white text-base whitespace-nowrap">
                        {formatCurrency(tx.amount)}
                      </td>

                      {/* Valid Date */}
                      <td className="px-5 py-4 text-xs whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Till {getValidUntilDate(tx.createdAt)}</span>
                          </div>
                          {isSubscriptionActive(tx.createdAt) ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-block">
                              Active Subscription
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 inline-block">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedTransaction(tx)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-orange-500/20 text-slate-300 hover:text-orange-400 border border-white/10 transition-colors cursor-pointer"
                            title="View Transaction Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {onDeleteTransaction && (
                            <button
                              onClick={() => setDeletingId(tx.id)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalTransactions}
            itemsPerPage={pageSize}
            onPageChange={onPageChange}
            onItemsPerPageChange={(limit) => {
              onFilterChange({ limit, page: 1 });
            }}
            itemLabel="transactions"
          />
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel bg-slate-950/95 border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Transaction Details</h3>
                  <p className="text-xs text-slate-400">ID: {selectedTransaction.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Shop info */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dealer Details</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-base">
                    {selectedTransaction.shop?.name || 'Unknown Shop'}
                  </span>
                  {selectedTransaction.shop && onViewShop && (
                    <button
                      onClick={() => {
                        const shop = selectedTransaction.shop as Shop;
                        setSelectedTransaction(null);
                        onViewShop(shop);
                      }}
                      className="text-xs font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      View Shop →
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  Owner: {selectedTransaction.shop?.ownerName || 'N/A'} ({selectedTransaction.shop?.phone || 'No Phone'})
                </div>
              </div>

              {/* Transaction breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Amount Paid</span>
                  <div className="text-xl font-black text-emerald-400">
                    {formatCurrency(selectedTransaction.amount)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Validity Period</span>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Till {getValidUntilDate(selectedTransaction.createdAt)}
                  </div>
                </div>
              </div>

              {/* Subscription details */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Subscription Name:</span>
                  <span className="font-bold text-white">{selectedTransaction.planName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Transaction Type:</span>
                  <span className="font-bold text-orange-400">{selectedTransaction.type}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Transaction Date:</span>
                  <span className="text-slate-300">{formatDate(selectedTransaction.createdAt)}</span>
                </div>
                {selectedTransaction.notes && (
                  <div className="pt-2 border-t border-white/5 text-xs text-slate-400">
                    <span className="font-bold text-slate-300">Notes:</span> {selectedTransaction.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel bg-slate-950 border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Delete Transaction Log</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete this transaction record? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/30"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
