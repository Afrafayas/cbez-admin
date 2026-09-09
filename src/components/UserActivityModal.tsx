import React, { useEffect, useState } from 'react';
import { ActivityLogItem } from '../types';
import { fetchUserActivityLogs } from '../services/adminApi';
import { X, History, Loader2, Calendar, UserCheck, LogIn, UserPlus, Store, ShoppingBag } from 'lucide-react';

interface UserActivityModalProps {
  userId: string | null;
  userName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserActivityModal: React.FC<UserActivityModalProps> = ({
  userId,
  userName,
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      fetchUserActivityLogs(userId)
        .then((fetchedLogs) => setLogs(fetchedLogs))
        .catch((err) => {
          console.error('Failed to load user logs:', err);
          setLogs([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, userId]);

  if (!isOpen || !userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-slate-900/90 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">User Activity Timeline</h3>
              <p className="text-xs text-slate-400">
                Activity history for <span className="text-orange-400 font-semibold">{userName || userId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-sm">Fetching user activity timeline...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <UserCheck className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No Activity Logs Found</p>
              <p className="text-xs text-slate-500">This user has not performed any recorded actions yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-orange-500/30 ml-4 pl-6 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-orange-500 group-hover:scale-125 transition-transform" />

                  {/* Activity Log Card */}
                  <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-950/60 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                        {log.action === 'LOGIN' && <LogIn className="w-3.5 h-3.5 text-emerald-400" />}
                        {log.action === 'REGISTER' && <UserPlus className="w-3.5 h-3.5 text-blue-400" />}
                        {log.action.includes('SHOP') && <Store className="w-3.5 h-3.5 text-amber-400" />}
                        {log.action.includes('PRODUCT') && <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />}
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200">{log.details || 'Action executed successfully'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
