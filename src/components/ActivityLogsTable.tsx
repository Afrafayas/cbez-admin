import React, { useState, useEffect } from 'react';
import { ActivityLogItem } from '../types';
import {
  History,
  LogIn,
  UserPlus,
  Store,
  ShoppingBag,
  ShieldAlert,
  Calendar,
  MousePointerClick,
  Heart,
  HeartOff,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { Pagination } from './Pagination';

interface ActivityLogsTableProps {
  logs: ActivityLogItem[];
  searchTerm: string;
  onSelectUserLogs?: (userId: string, userName: string) => void;
  onViewUser?: (userId: string, userName: string) => void;
  onRefresh?: () => Promise<void> | void;
}

export const ActivityLogsTable: React.FC<ActivityLogsTableProps> = ({
  logs,
  searchTerm,
  onSelectUserLogs,
  onViewUser,
  onRefresh,
}) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleManualRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const actionUpper = (log.action || '').toUpperCase();
    const matchesAction =
      filterAction === 'all' ||
      (filterAction === 'auth' && (actionUpper === 'LOGIN' || actionUpper === 'REGISTER')) ||
      (filterAction === 'clicks' &&
        (actionUpper === 'PRODUCT_CLICK' ||
          actionUpper === 'SHOP_CLICK' ||
          actionUpper.includes('CLICK'))) ||
      (filterAction === 'leads' &&
        (actionUpper === 'WHATSAPP_CLICK' ||
          actionUpper === 'CALL_CLICK' ||
          actionUpper.includes('WHATSAPP') ||
          actionUpper.includes('CALL'))) ||
      (filterAction === 'wishlist' && actionUpper.includes('WISHLIST')) ||
      (filterAction === 'shop' &&
        actionUpper.includes('SHOP') &&
        actionUpper !== 'SHOP_CLICK') ||
      (filterAction === 'product' &&
        actionUpper.includes('PRODUCT') &&
        actionUpper !== 'PRODUCT_CLICK');

    const userName = log.user?.name || '';
    const userEmail = log.user?.email || '';
    const userPhone = log.user?.phone || '';
    const details = log.details || '';
    const action = log.action || '';
    const s = searchTerm.toLowerCase();

    const matchesSearch =
      searchTerm === '' ||
      userName.toLowerCase().includes(s) ||
      userEmail.toLowerCase().includes(s) ||
      userPhone.toLowerCase().includes(s) ||
      details.toLowerCase().includes(s) ||
      action.toLowerCase().includes(s);

    return matchesAction && matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filterAction, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    switch (act) {
      case 'LOGIN':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <LogIn className="w-3.5 h-3.5" />
            LOGIN
          </span>
        );
      case 'REGISTER':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 w-fit">
            <UserPlus className="w-3.5 h-3.5 text-blue-400" />
            REGISTER
          </span>
        );
      case 'PRODUCT_CLICK':
      case 'CLICK_PRODUCT':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 w-fit">
            <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
            PRODUCT CLICK
          </span>
        );
      case 'SHOP_CLICK':
      case 'CLICK_SHOP':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            SHOP CLICK
          </span>
        );
      case 'WISHLIST':
      case 'WISHLIST_ADD':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 w-fit">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
            WISHLIST ADD
          </span>
        );
      case 'WISHLIST_REMOVE':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1.5 w-fit">
            <HeartOff className="w-3.5 h-3.5 text-slate-400" />
            WISHLIST REMOVE
          </span>
        );
      case 'WHATSAPP_CLICK':
      case 'WHATSAPP':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit shadow-sm shadow-emerald-500/10">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            WHATSAPP CLICK
          </span>
        );
      case 'CALL_CLICK':
      case 'CALL':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5 w-fit shadow-sm shadow-sky-500/10">
            <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
            CALL CLICK
          </span>
        );
      case 'VERIFY_SHOP':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1.5 w-fit">
            <Store className="w-3.5 h-3.5" />
            VERIFY SHOP
          </span>
        );
      case 'UNVERIFY_SHOP':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Store className="w-3.5 h-3.5" />
            UNVERIFY SHOP
          </span>
        );
      case 'CREATE_SHOP':
      case 'UPDATE_SHOP':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            {action.replace('_', ' ')}
          </span>
        );
      case 'CREATE_PRODUCT':
      case 'UPDATE_PRODUCT':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 w-fit">
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
            {act.replace('_', ' ')}
          </span>
        );
      case 'LOCATION_CLICK':
      case 'DIRECTIONS_CLICK':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 w-fit">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            {act.replace('_', ' ')}
          </span>
        );
      case 'DELETE_PRODUCT':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 w-fit">
            <ShoppingBag className="w-3.5 h-3.5" />
            DELETE PRODUCT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1.5 w-fit">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              User Activity Audit Logs
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {filteredLogs.length} Events
              </span>
            </h2>
            {onRefresh && (
              <button
                type="button"
                onClick={handleManualRefresh}
                title="Refresh Activity Logs"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-orange-400 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Live audit history of user logins, product/shop clicks, WhatsApp & Call leads, and wishlist events.
          </p>
        </div>

        {/* Filter Action Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-white/5 text-xs font-semibold overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterAction('all')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              filterAction === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilterAction('auth')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              filterAction === 'auth'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auth
          </button>
          <button
            onClick={() => setFilterAction('clicks')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              filterAction === 'clicks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Clicks
          </button>
          <button
            onClick={() => setFilterAction('leads')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              filterAction === 'leads'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Calls & WhatsApp
          </button>
          <button
            onClick={() => setFilterAction('wishlist')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              filterAction === 'wishlist'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wishlist
          </button>
          <button
            onClick={() => setFilterAction('shop')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              filterAction === 'shop'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shop Actions
          </button>
          <button
            onClick={() => setFilterAction('product')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              filterAction === 'product'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Product Actions
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl bg-slate-900/40">
        {/* Mobile View (visible < md) */}
        <div className="block md:hidden divide-y divide-white/5 p-3 space-y-3">
          {paginatedLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
              <p className="font-semibold text-slate-300">No Activity Logs Found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            paginatedLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 space-y-2.5 hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs shrink-0">
                      {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div className="min-w-0">
                      <button
                        onClick={() => {
                          if (log.userId && log.user) {
                            if (onViewUser) onViewUser(log.userId, log.user.name);
                            else if (onSelectUserLogs) onSelectUserLogs(log.userId, log.user.name);
                          }
                        }}
                        className={`font-bold text-xs truncate block text-left ${
                          log.userId && log.user ? 'text-white hover:text-orange-400 cursor-pointer group' : 'text-slate-300'
                        }`}
                      >
                        <span className="group-hover:underline">
                          {log.user?.name || (log.userId ? 'User: ' + log.userId.slice(-6) : 'Guest / Visitor')}
                        </span>
                      </button>
                      <div className="text-[10px] text-slate-400 truncate">
                        {log.user?.email || log.user?.phone || log.user?.role || (log.ipAddress ? 'IP: ' + log.ipAddress : 'Public Interaction')}
                      </div>
                    </div>
                  </div>

                  <div>{getActionBadge(log.action)}</div>
                </div>

                <div className="text-xs text-slate-200 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                  {log.details || 'Action executed'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="font-mono text-[10px] text-slate-500">
                    {log.userId ? `ID: ${log.userId}` : 'Guest Session'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (visible >= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/50 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                <th className="px-5 py-4">User / Actor</th>
                <th className="px-5 py-4">Action Type</th>
                <th className="px-5 py-4">Activity Description & Details</th>
                <th className="px-5 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                        <History className="w-6 h-6" />
                      </div>
                      <div className="text-base font-semibold text-slate-300">No Activity Logs Found</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No activity records matched your filter criteria or search keyword.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* User info */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                          {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              if (log.userId && log.user) {
                                if (onViewUser) onViewUser(log.userId, log.user.name);
                                else if (onSelectUserLogs) onSelectUserLogs(log.userId, log.user.name);
                              }
                            }}
                            className={`font-bold transition-colors text-left ${
                              log.userId && log.user ? 'text-white hover:text-orange-400 cursor-pointer group' : 'text-slate-300'
                            }`}
                          >
                            <span className="group-hover:underline">
                              {log.user?.name || (log.userId ? 'User ID: ' + log.userId.slice(-6) : 'Guest / Visitor')}
                            </span>
                          </button>
                          <div className="text-xs text-slate-400">
                            {log.user?.email || log.user?.phone || log.user?.role || (log.ipAddress ? 'IP: ' + log.ipAddress : 'Public Client')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">{getActionBadge(log.action)}</td>

                    {/* Details */}
                    <td className="px-5 py-4">
                      <div className="text-slate-200 text-xs font-medium">
                        {log.details || 'Action executed'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-3">
                        <span>{log.userId ? `User ID: ${log.userId}` : 'Guest Action'}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLogs.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="events"
        />
      </div>
    </div>
  );
};
