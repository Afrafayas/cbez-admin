import React from 'react';
import { Store, ShieldCheck, Clock, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { AdminStats } from '../types';

interface StatsOverviewProps {
  stats: AdminStats;
  onFilterStatus: (status: 'all' | 'verified' | 'pending') => void;
  selectedStatus: 'all' | 'verified' | 'pending';
  onNavigateToTransactions?: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  onFilterStatus,
  selectedStatus,
  onNavigateToTransactions,
}) => {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      id: 'revenue',
      title: 'Total Platform Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400',
      badge: 'Verified Billing',
      filterKey: null,
      onClick: onNavigateToTransactions,
    },
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isFilterClickable = card.filterKey !== null;
        const isCustomClickable = !!card.onClick;
        const isClickable = isFilterClickable || isCustomClickable;
        const isSelected = isFilterClickable && selectedStatus === card.filterKey;

        return (
          <div
            key={card.id}
            onClick={() => {
              if (isCustomClickable && card.onClick) {
                card.onClick();
              } else if (isFilterClickable && card.filterKey) {
                onFilterStatus(card.filterKey);
                setTimeout(() => {
                  const section = document.getElementById('shops-table-section');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 50);
              }
            }}
            className={`glass-panel p-3.5 sm:p-4 rounded-2xl border bg-gradient-to-br ${card.color} transition-all duration-200 ${
              isClickable ? 'cursor-pointer hover:scale-[1.02]' : ''
            } ${isSelected ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/20' : ''}`}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 line-clamp-1">
                {card.title}
              </span>
              <div className={`p-1.5 sm:p-2 rounded-xl bg-slate-900/60 border border-white/10 shrink-0 ${card.color.split(' ').pop()}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{card.value}</div>
              <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 truncate max-w-full">
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
