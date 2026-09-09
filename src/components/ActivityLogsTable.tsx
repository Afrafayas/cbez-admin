import React, { useState } from 'react';
import { ActivityLogItem } from '../types';
import { History, LogIn, UserPlus, Store, ShoppingBag, ShieldAlert, Calendar, UserCheck } from 'lucide-react';

interface ActivityLogsTableProps {
  logs: ActivityLogItem[];
  searchTerm: string;
  onSelectUserLogs?: (userId: string, userName: string) => void;
}

export const ActivityLogsTable: React.FC<ActivityLogsTableProps> = ({
  logs,
  searchTerm,
  onSelectUserLogs,
}) => {
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesAction =
      filterAction === 'all' ||
      (filterAction === 'auth' && (log.action === 'LOGIN' || log.action === 'REGISTER')) ||
      (filterAction === 'shop' && (log.action.includes('SHOP'))) ||
      (filterAction === 'product' && (log.action.includes('PRODUCT')));

    const userName = log.user?.name || '';
    const userEmail = log.user?.email || '';
    const details = log.details || '';
    const action = log.action || '';

    const matchesSearch =
      searchTerm === '' ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAction && matchesSearch;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <LogIn className="w-3 h-3" />
            LOGIN
          </span>
        );
      case 'REGISTER':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 w-fit">
            <UserPlus className="w-3 h-3 text-blue-400" />
            REGISTER
          </span>
        );
      case 'VERIFY_SHOP':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1.5 w-fit">
            <Store className="w-3 h-3" />
            VERIFY SHOP
          </span>
        );
      case 'UNVERIFY_SHOP':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Store className="w-3 h-3" />
            UNVERIFY SHOP
          </span>
        );
      case 'CREATE_SHOP':
      case 'UPDATE_SHOP':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Store className="w-3 h-3 text-amber-400" />
            {action.replace('_', ' ')}
          </span>
        );
      case 'CREATE_PRODUCT':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 w-fit">
            <ShoppingBag className="w-3 h-3 text-purple-400" />
            CREATE PRODUCT
          </span>
        );
      case 'DELETE_PRODUCT':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 w-fit">
            <ShoppingBag className="w-3 h-3" />
            DELETE PRODUCT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1.5 w-fit">
            <ShieldAlert className="w-3 h-3 text-slate-400" />
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            User Activity Audit Logs
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {filteredLogs.length} Events
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit history of user logins, shop creations, product updates, and verification actions.
          </p>
        </div>

        {/* Filter Action Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setFilterAction('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterAction === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs ({logs.length})
          </button>
          <button
            onClick={() => setFilterAction('auth')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterAction === 'auth'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auth (Login/Register)
          </button>
          <button
            onClick={() => setFilterAction('shop')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterAction === 'shop'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shop Actions
          </button>
          <button
            onClick={() => setFilterAction('product')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterAction === 'product'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Product Actions
          </button>
        </div>
      </div>

      {/* Main Activity Logs Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/50 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Action Type</th>
                <th className="px-5 py-4">Activity Description & Details</th>
                <th className="px-5 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredLogs.length === 0 ? (
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
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* User info */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                          {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <button
                            onClick={() =>
                              onSelectUserLogs && log.user && onSelectUserLogs(log.userId, log.user.name)
                            }
                            className="font-bold text-white hover:text-orange-400 transition-colors text-left cursor-pointer"
                          >
                            {log.user?.name || 'User ID: ' + log.userId.slice(-6)}
                          </button>
                          <div className="text-xs text-slate-400">
                            {log.user?.email || log.user?.role || 'User Activity'}
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
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        User ID: {log.userId}
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
      </div>
    </div>
  );
};
