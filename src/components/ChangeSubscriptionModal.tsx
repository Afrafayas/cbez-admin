import React, { useState, useEffect } from 'react';
import { Shop, SubscriptionPlan } from '../types';
import { X, CreditCard, CheckCircle2, ShieldCheck, ArrowUpRight, Tag, AlertCircle, Loader2 } from 'lucide-react';

interface ChangeSubscriptionModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  onAssignPlan: (shopId: string, planId: string) => Promise<void>;
  isLoading: boolean;
}

export const ChangeSubscriptionModal: React.FC<ChangeSubscriptionModalProps> = ({
  shop,
  isOpen,
  onClose,
  onAssignPlan,
  plans = [],
  isLoading,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shop) {
      const currentPlanId = shop.subscription?.planId || shop.subscription?.plan?.id || '';
      setSelectedPlanId(currentPlanId);
      setError(null);
    }
  }, [shop]);

  if (!isOpen || !shop) return null;

  const currentPlan = shop.subscription?.plan;
  const currentPlanName = currentPlan?.name || shop.subscriptionUsage?.planName || 'Free Starter Plan';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setError('Please select a subscription plan to assign');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAssignPlan(shop.id, selectedPlanId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlanObj = plans.find((p) => p.id === selectedPlanId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel bg-slate-950/95 border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Change Subscription Plan</h3>
              <p className="text-xs text-slate-400">Manage pricing tier & product quota for {shop.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Plan Overview Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Current Active Tier:</span>
            <span className="font-bold text-orange-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentPlanName}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Current Limit: <strong className="text-white">{shop.subscriptionUsage?.productLimit || currentPlan?.productLimit || 10} Products</strong>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Plan Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Select New Subscription Plan:
            </label>

            {plans.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No active plans available</div>
            ) : (
              plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const isCurrent = currentPlan?.id === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500/50 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/50'
                        : 'bg-slate-900/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{plan.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Limit: <strong className="text-slate-200">{plan.productLimit} Products</strong></span>
                        <span>•</span>
                        <span>Price: <strong className="text-emerald-400">₹{plan.price}</strong></span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-slate-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !selectedPlanId}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Plan...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Confirm & Upgrade Plan (₹${selectedPlanObj?.price || 0})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
