import React from 'react';
import { Store, ShieldCheck, Clock, ShoppingBag, MessageSquareText, Users } from 'lucide-react';
import { AdminStats } from '../types';

interface StatsOverviewProps {
  stats: AdminStats;
  onFilterStatus: (status: 'all' | 'verified' | 'pending') => void;
  selectedStatus: 'all' | 'verified' | 'pending';
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, onFilterStatus, selectedStatus }) => {
  const cards = [
    {
      id: 'all',
      title: 'Total Registered Shops',
      value: stats.totalShops,
      icon: Store,
      color: 'from-orange-600/20 to-amber-600/20 border-orange-500/30 text-orange-400',
      badge: 'All Stores',
      filterKey: 'all' as const,
    },
    {
      id: 'verified',
      title: 'Verified Seller Shops',
      value: stats.verifiedShops,
      icon: ShieldCheck,
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400',
      badge: `${stats.totalShops > 0 ? Math.round((stats.verifiedShops / stats.totalShops) * 100) : 0}% Verified`,
      filterKey: 'verified' as const,
    },
    {
      id: 'pending',
      title: 'Pending Verification',
      value: stats.pendingShops,
      icon: Clock,
      color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400',
      badge: stats.pendingShops > 0 ? 'Requires Action' : 'All Clear',
      filterKey: 'pending' as const,
    },
    {
      id: 'products',
      title: 'Total Active Products',
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: 'from-orange-500/15 to-rose-600/20 border-orange-400/30 text-orange-300',
      badge: 'Catalog Listings',
      filterKey: null,
    },
    {
      id: 'leads',
      title: 'Customer Leads',
      value: stats.totalLeads,
      icon: MessageSquareText,
      color: 'from-cyan-600/20 to-sky-600/20 border-cyan-500/30 text-cyan-400',
      badge: 'WhatsApp & Call Inquiries',
      filterKey: null,
    },
    {
      id: 'users',
      title: 'Total Users Registered',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-400',
      badge: 'Customers & Sellers',
      filterKey: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = card.filterKey !== null;
        const isSelected = isClickable && selectedStatus === card.filterKey;

        return (
          <div
            key={card.id}
            onClick={() => isClickable && card.filterKey && onFilterStatus(card.filterKey)}
            className={`glass-panel p-4 rounded-2xl border bg-gradient-to-br ${card.color} transition-all duration-200 ${
              isClickable ? 'cursor-pointer hover:scale-[1.02]' : ''
            } ${isSelected ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/20' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-slate-900/60 border border-white/10 ${card.color.split(' ').pop()}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-white tracking-tight">{card.value}</div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/10 text-slate-300">
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
