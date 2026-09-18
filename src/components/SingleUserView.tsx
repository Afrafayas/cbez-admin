import React, { useState, useEffect } from 'react';
import { UserAccount, ActivityLogItem, Shop } from '../types';
import { fetchUserActivityLogs } from '../services/adminApi';
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Calendar,
  Store,
  Shield,
  ShieldCheck,
  Edit2,
  Trash2,
  History,
  LogIn,
  UserPlus,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Clock,
  Loader2,
} from 'lucide-react';

interface SingleUserViewProps {
  user: UserAccount;
  onBack: () => void;
  onEdit?: (user: UserAccount) => void;
  onDelete?: (user: UserAccount) => void;
  onViewShop?: (shop: Shop | { id: string; name: string }) => void;
}

export const SingleUserView: React.FC<SingleUserViewProps> = ({
  user,
  onBack,
  onEdit,
  onDelete,
  onViewShop,
}) => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);

  useEffect(() => {
    if (user.id) {
      setIsLoadingLogs(true);
      fetchUserActivityLogs(user.id)
        .then((fetched) => setLogs(fetched))
        .catch((err) => {
          console.error('Failed to load user logs:', err);
          setLogs([]);
        })
        .finally(() => setIsLoadingLogs(false));
    }
  }, [user.id]);

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5 w-fit">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            ADMINISTRATOR
          </span>
        );
      case 'seller':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1.5 w-fit">
            <Store className="w-3.5 h-3.5 text-orange-400" />
            DEALER / SELLER
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 w-fit">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            CUSTOMER
          </span>
        );
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <LogIn className="w-3 h-3" />
            LOGIN
          </span>
        );
      case 'REGISTER':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <UserPlus className="w-3 h-3" />
            REGISTER
          </span>
        );
      case 'CREATE_PRODUCT':
      case 'UPDATE_PRODUCT':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            {action.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
            <History className="w-3 h-3" />
            {action.replace('_', ' ')}
          </span>
        );
    }
  };

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
            <span>Back to Users</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span>Users</span>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[200px]">{user.name}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onEdit && (
            <button
              onClick={() => onEdit(user)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit User</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(user)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete User</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-xl shadow-orange-500/25 border border-orange-400/30 shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.name}
                </h1>
                {getRoleBadge(user.role)}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex flex-wrap items-center gap-3 font-mono">
                <span>ID: {user.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-sans">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Registered{' '}
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid: Profile Info & Linked Shop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            Contact & Profile
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Email Address</span>
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="truncate">{user.email || 'No email registered'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <span className="text-slate-400 block text-[11px] mb-1">Phone Number</span>
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>{user.phone || 'No phone registered'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <span className="text-slate-400 block text-[11px] mb-1">System Role</span>
              <span className="capitalize text-slate-200 font-semibold">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Linked Dealer Shop Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-400" />
              Linked Store Information
            </h2>
            {user.shop?.verified && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          {user.shop ? (
            <div
              onClick={() => onViewShop && onViewShop(user.shop as any)}
              className="p-4 rounded-xl bg-slate-950/70 border border-white/10 hover:border-orange-500/40 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
                  {user.shop.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors truncate flex items-center gap-1.5">
                    <span>{user.shop.name}</span>
                    <ExternalLink className="w-4 h-4 opacity-60" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {user.shop.city} • {user.shop.category}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/30 rounded-xl border border-dashed border-white/5">
              This user account is not currently associated with an active store listing.
            </div>
          )}
        </div>
      </div>

      {/* User Activity History Timeline */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl bg-slate-900/60">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" />
              User Activity History ({logs.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of user interactions and transactions.
            </p>
          </div>
        </div>

        {isLoadingLogs ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <span className="text-xs">Loading activity timeline...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
            <p className="font-semibold text-slate-300">No activity recorded</p>
            <p className="text-xs text-slate-500">This user has no recorded actions or sessions yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div>{getActionBadge(log.action)}</div>
                  <div>
                    <span className="text-slate-200 font-medium">{log.details || 'Action executed'}</span>
                    {log.ipAddress && (
                      <span className="text-[10px] text-slate-500 font-mono block sm:inline sm:ml-2">
                        IP: {log.ipAddress}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 shrink-0 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
