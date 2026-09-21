import React, { useState } from 'react';
import { SubscriptionPlan, Shop, Product, getShopProductCount } from '../types';
import { Plus, Edit2, Trash2, Power, CheckCircle2, XCircle, CreditCard, UserCheck, X, Search, Store, Filter, RefreshCw } from 'lucide-react';

interface SubscriptionsTableProps {
  plans: SubscriptionPlan[];
  shops?: Shop[];
  products?: Product[];
  onCreatePlan: (dto: any) => Promise<void>;
  onUpdatePlan: (id: string, dto: any) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
  onDeletePlan: (id: string) => Promise<void>;
  onAssignPlanToShop?: (shopId: string, planId: string) => Promise<void>;
  onViewShop?: (shop: Shop) => void;
  isLoading?: boolean;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({
  plans,
  shops = [],
  products = [],
  onCreatePlan,
  onUpdatePlan,
  onToggleStatus,
  onDeletePlan,
  onAssignPlanToShop,
  onViewShop,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'dealers' | 'plans'>('dealers');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Create/Edit Plan Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    productLimit: 10,
    price: 0,
    status: 'ACTIVE',
  });

  // Assign Subscription Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetShop, setTargetShop] = useState<Shop | null>(null);
  const [assignShopId, setAssignShopId] = useState('');
  const [assignPlanId, setAssignPlanId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter Dealers by Selected Subscription Plan & Search Term
  const filteredDealers = shops.filter((shop) => {
    const shopPlanName = shop.subscription?.plan?.name || 'Free Starter Plan';
    if (selectedPlanFilter !== 'all' && shopPlanName !== selectedPlanFilter) {
      return false;
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchName = shop.name.toLowerCase().includes(term);
      const matchOwner = shop.ownerName.toLowerCase().includes(term);
      const matchCity = shop.city.toLowerCase().includes(term);
      return matchName || matchOwner || matchCity;
    }
    return true;
  });

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanFormData({ name: '', description: '', productLimit: 10, price: 0, status: 'ACTIVE' });
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description || '',
      productLimit: plan.productLimit,
      price: plan.price || 0,
      status: plan.status || 'ACTIVE',
    });
    setShowPlanModal(true);
  };

  const handleOpenAssignModal = (shop?: Shop) => {
    if (shop) {
      setTargetShop(shop);
      setAssignShopId(shop.id);
      const currentPlanId = shop.subscription?.planId || shop.subscription?.plan?.id || plans[0]?.id || '';
      setAssignPlanId(currentPlanId);
    } else {
      setTargetShop(null);
      if (shops.length > 0) setAssignShopId(shops[0].id);
      if (plans.length > 0) setAssignPlanId(plans[0].id);
    }
    setShowAssignModal(true);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPlan(true);
    try {
      if (editingPlan) {
        await onUpdatePlan(editingPlan.id, planFormData);
      } else {
        await onCreatePlan(planFormData);
      }
      setShowPlanModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignShopId || !assignPlanId || !onAssignPlanToShop) return;
    setIsAssigning(true);
    try {
      await onAssignPlanToShop(assignShopId, assignPlanId);
      setShowAssignModal(false);
      setAssignShopId('');
      setAssignPlanId('');
      setTargetShop(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-400" />
            Subscription & Dealer Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage dealer subscription plan assignments, filter dealers by subscription tier, and configure plan pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onAssignPlanToShop && (
            <button
              onClick={() => handleOpenAssignModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              Assign Plan to Dealer
            </button>
          )}

          <button
            onClick={handleOpenCreatePlan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Plan Template
          </button>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex border-b border-white/10 text-sm font-bold gap-6">
        <button
          onClick={() => setActiveTab('dealers')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'dealers' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          Subscribed Dealers Directory ({shops.length})
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'plans' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Subscription Plan Templates ({plans.length})
        </button>
      </div>

      {activeTab === 'dealers' ? (
        /* --- VIEW 1: SUBSCRIBED DEALERS DIRECTORY WITH SUBSCRIPTION FILTERS --- */
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-400" />
                Filter Dealers by Subscription Plan
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Select a subscription plan tier to filter active store listings.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dealer or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Subscription-Based Filter Pills */}
              <div className="flex p-1 rounded-xl bg-slate-950 border border-white/10 text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setSelectedPlanFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedPlanFilter === 'all'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Plans ({shops.length})
                </button>
                {plans.map((p) => {
                  const count = shops.filter(s => (s.subscription?.plan?.name || 'Free Starter Plan') === p.name).length;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlanFilter(p.name)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        selectedPlanFilter === p.name
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subscribed Dealers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/40 text-slate-400 text-xs uppercase font-semibold whitespace-nowrap">
                  <th className="p-4">Store Details</th>
                  <th className="p-4">Owner & Contact</th>
                  <th className="p-4">Location & Category</th>
                  <th className="p-4">Assigned Subscription Plan</th>
                  <th className="p-4 text-center">Listings Used</th>
                  <th className="p-4 text-right">Assign Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredDealers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No dealers found matching the selected subscription filter.
                    </td>
                  </tr>
                ) : (
                  filteredDealers.map((shop) => {
                    const subPlan = shop.subscription?.plan;
                    const planName = subPlan?.name || 'Free Starter Plan';
                    const productLimit = subPlan?.productLimit ?? 5;
                    const price = subPlan?.price ?? 0;
                    const productCount = getShopProductCount(shop, products);
                    const isLimitReached = productCount >= productLimit;

                    return (
                      <tr key={shop.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-4">
                          {onViewShop ? (
                            <button
                              type="button"
                              onClick={() => onViewShop(shop)}
                              className="font-bold text-white hover:text-orange-400 text-sm flex items-center gap-2 text-left cursor-pointer group transition-colors"
                            >
                              <span className="group-hover:underline">{shop.name}</span>
                              {shop.verified && (
                                <span title="Verified Store">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                </span>
                              )}
                            </button>
                          ) : (
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              {shop.name}
                              {shop.verified && (
                                <span title="Verified Store">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-slate-400 text-[11px] truncate max-w-[200px]">{shop.address}</div>
                        </td>

                        <td className="p-4">
                          <div className="text-slate-200 font-semibold">{shop.ownerName}</div>
                          <div className="text-slate-400 text-[11px]">{shop.phone}</div>
                        </td>

                        <td className="p-4">
                          <div className="text-slate-200 font-medium">{shop.city}</div>
                          <div className="text-slate-400 text-[11px]">{shop.category}</div>
                        </td>

                        <td className="p-4">
                          <div className="inline-flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 font-bold text-xs whitespace-nowrap">
                              <CreditCard className="w-3.5 h-3.5 text-orange-400" />
                              {planName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                              Limit: {productLimit} Products | Fixed Price: ₹{price}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs border whitespace-nowrap ${
                            isLimitReached
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-slate-800 text-slate-200 border-white/10'
                          }`}>
                            {productCount} / {productLimit} Items
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenAssignModal(shop)}
                            className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Assign / Upgrade Plan
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* --- VIEW 2: SUBSCRIPTION PLAN TEMPLATES CONFIGURATION --- */
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
            <div>
              <h2 className="text-base font-bold text-white">Configured Subscription Plan Templates</h2>
              <p className="text-xs text-slate-400">Configure subscription plans, set product listing limits, and define fixed pricing.</p>
            </div>
            <button
              onClick={handleOpenCreatePlan}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Plan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/40 text-slate-400 text-xs uppercase font-semibold">
                  <th className="p-4">Plan Name & Description</th>
                  <th className="p-4">Product Limit</th>
                  <th className="p-4">Fixed Amount</th>
                  <th className="p-4">Subscribed Stores</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No subscription plans found. Click "Create New Plan" to add one.
                    </td>
                  </tr>
                ) : (
                  plans.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{p.name}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{p.description || 'No description'}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 font-extrabold text-xs">
                          {p.productLimit} Products
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white text-sm">₹{p.price ? p.price.toLocaleString('en-IN') : '0'}</td>
                      <td className="p-4 text-slate-300 font-semibold">{p._count?.subscriptions ?? 0} Stores</td>
                      <td className="p-4">
                        {p.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 text-[11px] font-bold">
                            <XCircle className="w-3 h-3" /> INACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onToggleStatus(p.id)}
                            title="Toggle Active Status"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditPlan(p)}
                            title="Edit Plan Details"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePlan(p.id)}
                            title="Delete Plan"
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Create / Edit Subscription Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h3>
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  placeholder="e.g. Free Starter Plan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  value={planFormData.description}
                  onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                  placeholder="Summary of plan features and target shop tier..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product Limit *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planFormData.productLimit}
                    onChange={(e) => setPlanFormData({ ...planFormData, productLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fixed Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={planFormData.price}
                    onChange={(e) => setPlanFormData({ ...planFormData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={planFormData.status}
                  onChange={(e) => setPlanFormData({ ...planFormData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlan}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPlan ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assign Subscription Plan to Dealer */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 bg-slate-950 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-400" />
                Assign Subscription Plan to Dealer
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Dealer / Shop *</label>
                <select
                  required
                  value={assignShopId}
                  onChange={(e) => {
                    setAssignShopId(e.target.value);
                    const s = shops.find(item => item.id === e.target.value);
                    if (s) setTargetShop(s);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ({s.ownerName}, {s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Subscription Plan *</label>
                <select
                  required
                  value={assignPlanId}
                  onChange={(e) => setAssignPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Limit: {p.productLimit} Products (Price: ₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              {targetShop && (
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-slate-300 space-y-1">
                  <div><strong>Selected Dealer:</strong> {targetShop.name}</div>
                  <div><strong>Current Plan:</strong> {targetShop.subscription?.plan?.name || 'Free Starter Plan'}</div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isAssigning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
