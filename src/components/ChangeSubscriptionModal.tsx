import React, { useState, useEffect } from 'react';
import { Shop, SubscriptionPlan } from '../types';
import {
  X,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  Receipt,
  Sparkles,
  Clock,
} from 'lucide-react';

interface ChangeSubscriptionModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  onAssignPlan: (
    shopId: string,
    planId: string,
    extra?: {
      transactionMode?: string;
      transactionId?: string;
      amount?: number;
      notes?: string;
    }
  ) => Promise<void>;
  isLoading: boolean;
}

const PAYMENT_MODES = [
  { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm / BHIM)' },
  { value: 'Cash', label: 'Cash Payment' },
  { value: 'Bank Transfer', label: 'Bank Transfer (NEFT / IMPS / RTGS)' },
  { value: 'Card', label: 'Credit / Debit Card' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Other', label: 'Other Mode' },
];

export const ChangeSubscriptionModal: React.FC<ChangeSubscriptionModalProps> = ({
  shop,
  isOpen,
  onClose,
  onAssignPlan,
  plans = [],
  isLoading,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [transactionMode, setTransactionMode] = useState<string>('UPI');
  const [transactionId, setTransactionId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shop && isOpen) {
      const currentPlanId = shop.subscription?.planId || shop.subscription?.plan?.id || '';
      setSelectedPlanId(currentPlanId);
      const matchedPlan = plans.find((p) => p.id === currentPlanId);
      setAmount(matchedPlan?.price || 0);
      setTransactionMode('UPI');
      setTransactionId('');
      setNotes(`Subscription renewal/upgrade for store ${shop.name}`);
      setError(null);
    }
  }, [shop, isOpen, plans]);

  if (!isOpen || !shop) return null;

  const currentPlan = shop.subscription?.plan;
  const currentPlanName = currentPlan?.name || shop.subscriptionUsage?.planName || 'Free Starter Plan';
  const selectedPlanObj = plans.find((p) => p.id === selectedPlanId);
  const isCurrentActive = Boolean(
    shop.subscription &&
      !shop.isSubscriptionExpired &&
      !shop.subscriptionUsage?.isExpired
  );

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlanId(plan.id);
    setAmount(plan.price || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setError('Please select a subscription plan to assign');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAssignPlan(shop.id, selectedPlanId, {
        transactionMode,
        transactionId: transactionId.trim() || undefined,
        amount: Number(amount) || 0,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel bg-slate-950/95 border border-white/15 rounded-3xl max-w-lg w-full shadow-2xl relative text-white flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Fixed top */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Change / Renew Subscription</h3>
              <p className="text-xs text-slate-400">Manage plan tier, validity & transactions for {shop.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form with scrollable body and pinned footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {/* Current Plan Overview Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Current Active Tier:</span>
                <span className="font-bold text-orange-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentPlanName}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Limit: <strong className="text-white">{shop.subscriptionUsage?.productLimit || currentPlan?.productLimit || 10} Products</strong>
                </span>
                {shop.subscriptionUsage?.endDate && (
                  <span className="text-[11px] text-amber-300">
                    Expires: {new Date(shop.subscriptionUsage.endDate).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>

              {isCurrentActive && (
                <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-blue-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Active plan running. Activating a new plan now will <strong>queue</strong> it to start after current plan expires (mobile recharge logic).
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Plan Selection Form */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Select Subscription Plan:
              </label>

              {plans.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No active plans available</div>
              ) : (
                plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isCurrent = currentPlan?.id === plan.id;
                  const duration = plan.durationDays || 30;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan)}
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
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>Limit: <strong className="text-slate-200">{plan.productLimit} Items</strong></span>
                          <span>•</span>
                          <span className="text-blue-300 font-semibold">{duration} Days</span>
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

            {/* Transaction Section */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-orange-400" />
                <span>Record Transaction:</span>
              </label>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Amount (₹):</label>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Payment Mode:</label>
                  <select
                    value={transactionMode}
                    onChange={(e) => setTransactionMode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-white text-xs"
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m.value} value={m.value} className="bg-slate-900">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Transaction ID / Ref (Optional):
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. UTR-12345678"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer - Pinned Bottom */}
          <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-end gap-3 bg-slate-950/90 shrink-0">
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
                  <span>Saving Plan & Transaction...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>
                    {isCurrentActive ? 'Queue / Upgrade Plan' : 'Activate Plan'} (₹{amount})
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
