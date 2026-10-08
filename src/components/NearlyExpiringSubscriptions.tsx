import React, { useState } from 'react';
import { Shop } from '../types';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building2,
  Bell,
  RefreshCw,
  Search,
  ExternalLink,
  Phone,
  Sparkles,
} from 'lucide-react';
import { triggerExpiryAlertsApi } from '../services/adminApi';

interface NearlyExpiringSubscriptionsProps {
  shops: Shop[];
  onViewShop: (shop: Shop) => void;
  onRenewPlan?: (shop: Shop) => void;
  onShowToast?: (message: string, type?: string) => void;
}

type TabType = 'subscribed' | 'expiring_soon' | 'trial' | 'expired';

export const NearlyExpiringSubscriptions: React.FC<NearlyExpiringSubscriptionsProps> = ({
  shops = [],
  onViewShop,
  onRenewPlan,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const stored = localStorage.getItem('cbez_admin_expiring_subtab');
      if (stored && ['subscribed', 'expiring_soon', 'trial', 'expired'].includes(stored)) {
        return stored as TabType;
      }
    } catch (e) {}
    return 'expiring_soon';
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('cbez_admin_expiring_subtab', tab);
    } catch (e) {}
  };
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSendingAlerts, setIsSendingAlerts] = useState<boolean>(false);
  const [lastAlertSummary, setLastAlertSummary] = useState<{
    alertsSent: number;
    timestamp: string;
  } | null>(null);

  const now = new Date();

  // Process and compute subscription status for all shops
  const allSubscriptionItems = shops.map((shop) => {
    const sub = shop.subscription;
    const plan = sub?.plan;
    const planName = plan?.name || shop.subscriptionUsage?.planName || 'Standard Plan';
    const durationDays = plan?.durationDays || 30;

    let startDate: Date;
    if (sub?.startDate) {
      startDate = new Date(sub.startDate);
    } else if (sub?.createdAt) {
      startDate = new Date(sub.createdAt);
    } else {
      startDate = new Date(shop.createdAt);
    }

    let endDate: Date;
    if (sub?.endDate) {
      endDate = new Date(sub.endDate);
    } else {
      endDate = new Date(startDate.getTime() + durationDays * 86400000);
    }

    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    const isExpired = sub ? sub.status === 'EXPIRED' || diffMs <= 0 : false;
    const isTrial =
      Boolean(plan?.price === 0) ||
      planName.toLowerCase().includes('trial') ||
      planName.toLowerCase().includes('starter') ||
      planName.toLowerCase().includes('free');

    const isExpiringSoon = !isExpired && diffDays <= 10 && diffDays >= 0;
    const hasActiveSubscription = !isExpired && diffDays > 0;

    // 2-Letter Initials for Avatar
    const initials = shop.name
      ? shop.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0].toUpperCase())
          .join('') || shop.name.slice(0, 2).toUpperCase()
      : 'ST';

    // Format start & expiry date (M/D/YYYY) matching reference image
    const formattedStartDate = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}`;
    const formattedExpiryDate = `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;

    return {
      shop,
      plan,
      planName,
      startDate,
      endDate,
      diffDays,
      isExpired,
      isTrial,
      isExpiringSoon,
      hasActiveSubscription,
      initials,
      formattedStartDate,
      formattedExpiryDate,
    };
  });

  // Tab Counts
  const countSubscribed = allSubscriptionItems.filter((i) => i.hasActiveSubscription).length;
  const countExpiringSoon = allSubscriptionItems.filter((i) => i.isExpiringSoon).length;
  const countTrial = allSubscriptionItems.filter((i) => i.isTrial && !i.isExpired).length;
  const countExpired = allSubscriptionItems.filter((i) => i.isExpired).length;

  // Filter items by active tab and search term
  const filteredItems = allSubscriptionItems.filter((item) => {
    // Tab filter
    if (activeTab === 'subscribed') {
      if (!item.hasActiveSubscription) return false;
    } else if (activeTab === 'expiring_soon') {
      if (!item.isExpiringSoon) return false;
    } else if (activeTab === 'trial') {
      if (!item.isTrial || item.isExpired) return false;
    } else if (activeTab === 'expired') {
      if (!item.isExpired) return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = item.shop.name.toLowerCase().includes(term);
      const matchOwner = item.shop.ownerName?.toLowerCase().includes(term);
      const matchCity = item.shop.city?.toLowerCase().includes(term);
      const matchPlan = item.planName.toLowerCase().includes(term);
      if (!matchName && !matchOwner && !matchCity && !matchPlan) return false;
    }

    return true;
  });

  // Sort: for expiring soon, sort by days remaining ascending
  if (activeTab === 'expiring_soon') {
    filteredItems.sort((a, b) => a.diffDays - b.diffDays);
  }

  // Handle manual trigger of daily mobile alerts
  const handleTriggerAlerts = async () => {
    setIsSendingAlerts(true);
    try {
      const res = await triggerExpiryAlertsApi();
      setLastAlertSummary({
        alertsSent: res.alertsSent || 0,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      });
      if (onShowToast) {
        onShowToast(
          `Mobile alert check finished: ${res.alertsSent || 0} expiry alerts delivered via WhatsApp.`,
          'success'
        );
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(err.message || 'Failed to dispatch mobile alerts', 'error');
      }
    } finally {
      setIsSendingAlerts(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6 bg-slate-950/80">
      {/* Top Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Subscription Lifecycle Management</span>
            {countExpiringSoon > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {countExpiringSoon} Expiring Soon
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor company and store subscription lifecycles, track days remaining, and manage automatic 5-day expiry mobile alerts.
          </p>
        </div>

        {/* Action: Trigger Alerts Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerAlerts}
            disabled={isSendingAlerts}
            className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Dispatch WhatsApp mobile alert to all stores within 5 days of expiry"
          >
            {isSendingAlerts ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isSendingAlerts ? 'Sending Alerts...' : 'Dispatch Mobile Alerts (5 Days)'}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar matching Reference UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subscribed Tab */}
          <button
            onClick={() => handleTabChange('subscribed')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'subscribed'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <span>Subscribed</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'subscribed'
                  ? 'bg-slate-200 text-slate-900'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {countSubscribed}
            </span>
          </button>

          {/* Expiring Soon Tab (Active highlight style) */}
          <button
            onClick={() => handleTabChange('expiring_soon')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'expiring_soon'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10 font-extrabold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Expiring Soon</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'expiring_soon'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {countExpiringSoon}
            </span>
          </button>

          {/* Trial Period Tab */}
          <button
            onClick={() => handleTabChange('trial')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'trial'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <span>Trial Period</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'trial' ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {countTrial}
            </span>
          </button>

          {/* Expired Tab */}
          <button
            onClick={() => handleTabChange('expired')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'expired'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-extrabold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <span>Expired</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'expired' ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {countExpired}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search companies / stores..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Table Content matching Reference Image */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/50">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Plan Type</th>
              <th className="py-3.5 px-4">Start Date</th>
              <th className="py-3.5 px-4">Expiry Date</th>
              <th className="py-3.5 px-4">Days Left</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-bold text-white text-sm">No Records Found</p>
                    <p className="text-xs text-slate-400">
                      {activeTab === 'expiring_soon'
                        ? 'No stores are expiring within the next 10 days.'
                        : 'No subscription items found matching your current filter.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map(
                ({
                  shop,
                  planName,
                  isTrial,
                  formattedStartDate,
                  formattedExpiryDate,
                  diffDays,
                  isExpired,
                  initials,
                }) => {
                  const hasQueued = (shop.queuedSubscriptions?.length || 0) > 0;
                  const isCritical = diffDays <= 2 && diffDays >= 0;

                  return (
                    <tr
                      key={shop.id}
                      className="hover:bg-white/[0.03] transition-colors border-b border-white/[0.02]"
                    >
                      {/* COMPANY / STORE */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <button
                              onClick={() => onViewShop(shop)}
                              className="font-bold text-white hover:text-orange-400 transition-colors text-xs text-left block truncate max-w-[180px] cursor-pointer"
                            >
                              {shop.name}
                            </button>
                            <span className="text-[11px] text-slate-400 truncate block max-w-[180px]">
                              {shop.ownerName || shop.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* PLAN TYPE (Pill Badge) */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isTrial
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          }`}
                        >
                          {planName}
                        </span>
                        {hasQueued && (
                          <span className="block text-[10px] text-emerald-400 font-semibold mt-1">
                            Queued Pack Ready
                          </span>
                        )}
                      </td>

                      {/* START DATE */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {formattedStartDate}
                      </td>

                      {/* EXPIRY DATE */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {formattedExpiryDate}
                      </td>

                      {/* DAYS LEFT */}
                      <td className="py-3.5 px-4">
                        {isExpired || diffDays < 0 ? (
                          <span className="text-red-400 font-bold">
                            Expired ({Math.abs(diffDays)}d ago)
                          </span>
                        ) : isCritical ? (
                          <span className="text-red-400 font-black">
                            {diffDays} {diffDays === 1 ? 'day remaining' : 'days remaining'}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-semibold">
                            {diffDays} days remaining
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewShop(shop)}
                            className="px-3 py-1 text-slate-300 hover:text-white hover:underline text-xs font-bold transition-all cursor-pointer"
                          >
                            View
                          </button>

                          {onRenewPlan && (
                            <button
                              onClick={() => onRenewPlan(shop)}
                              className="px-2.5 py-1 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-[11px] font-bold transition-all cursor-pointer"
                              title="Renew or queue subscription pack"
                            >
                              Renew
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Recharge Logic Information Note */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-white block font-bold">
            Mobile Recharge Logic & Daily Alert Automation Active
          </strong>
          <p className="text-slate-300 text-[11px]">
            • <strong>5-Day Expiry Alerts:</strong> The system automatically alerts the agent's mobile number via WhatsApp daily for all 5 days before plan expiry.
          </p>
          <p className="text-slate-300 text-[11px]">
            • <strong>Automatic Queue Pack Activation:</strong> If a plan is assigned while an active plan is running, it queues automatically and activates the moment the current plan expires, just like a mobile recharge pack.
          </p>
        </div>
      </div>
    </div>
  );
};
