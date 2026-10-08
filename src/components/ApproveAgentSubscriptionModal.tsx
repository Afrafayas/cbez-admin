import React, { useState, useEffect } from 'react';
import { Shop, SubscriptionPlan } from '../types';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  AlertCircle,
  Loader2,
  Sparkles,
  CreditCard,
  Building2,
  Phone,
  MapPin,
} from 'lucide-react';

interface ApproveAgentSubscriptionModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  onConfirm: (
    shopId: string,
    planId: string,
    transactionMode: string,
    transactionId: string,
    amount: number,
    notes: string
  ) => Promise<void>;
  isLoading?: boolean;
}

const PAYMENT_MODES = [
  { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm / BHIM)' },
  { value: 'Cash', label: 'Cash Payment' },
  { value: 'Bank Transfer', label: 'Bank Transfer (NEFT / IMPS / RTGS)' },
  { value: 'Card', label: 'Credit / Debit Card' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Other', label: 'Other Mode' },
];

export const ApproveAgentSubscriptionModal: React.FC<ApproveAgentSubscriptionModalProps> = ({
  shop,
  isOpen,
  onClose,
  plans = [],
  onConfirm,
  isLoading = false,
}) => {
  const activePlans = plans.filter((p) => p.status === 'ACTIVE');
  const displayPlans = activePlans.length > 0 ? activePlans : plans;

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [transactionMode, setTransactionMode] = useState<string>('UPI');
  const [transactionId, setTransactionId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize or reset form when shop changes or modal opens
  useEffect(() => {
    if (shop && isOpen) {
      setError(null);
      // Auto-select existing plan or first available plan
      const defaultPlan =
        displayPlans.find((p) => p.id === shop.subscription?.planId) ||
        displayPlans[0];

      if (defaultPlan) {
        setSelectedPlanId(defaultPlan.id);
        setAmount(defaultPlan.price || 0);
      } else {
        setSelectedPlanId('');
        setAmount(0);
      }

      setTransactionMode('UPI');
      setTransactionId('');
      setNotes(`Approved registration for store "${shop.name}"`);
    }
  }, [shop, isOpen, plans]);

  // When plan changes, update the amount to match plan price
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlanId(plan.id);
    setAmount(plan.price || 0);
  };

  if (!isOpen || !shop) return null;

  const selectedPlan = displayPlans.find((p) => p.id === selectedPlanId);
  const durationDays = selectedPlan?.durationDays || 30;

  // Calculate projected expiry date
  const projectedExpiry = new Date();
  projectedExpiry.setDate(projectedExpiry.getDate() + durationDays);
  const formattedExpiry = projectedExpiry.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setError('Please select a subscription plan before verifying the store.');
      return;
    }

    if (!transactionId.trim() && transactionMode !== 'Cash') {
      setError('Please enter a Transaction ID or UTR Reference number for online payment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(
        shop.id,
        selectedPlanId,
        transactionMode,
        transactionId.trim() || `CASH-${Date.now().toString().slice(-6)}`,
        Number(amount) || 0,
        notes.trim()
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to verify store and record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel bg-slate-950/95 border border-white/15 rounded-3xl max-w-xl w-full shadow-2xl relative text-white flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed top */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">Verify Store & Assign Subscription</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Pending Verification
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a subscription plan and record the payment transaction to activate this store.
              </p>
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

        {/* Form Container with scrollable body and pinned footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
            {/* Store Info Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Store Name:</span>
                <strong className="text-white text-sm font-bold truncate block">{shop.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Dealer / Owner:</span>
                <strong className="text-white text-sm font-bold truncate block">{shop.ownerName}</strong>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{shop.phone || shop.whatsapp || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{shop.city} • {shop.category}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Plan Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-orange-400" />
                  <span>1. Select Subscription Plan:</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {displayPlans.length} plans available
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {displayPlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const pDuration = plan.durationDays || 30;

                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500/60 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/50'
                        : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white text-sm">{plan.name}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500 text-white'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        <strong className="text-slate-200">{plan.productLimit}</strong> Products
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                        {pDuration} Days
                      </span>
                      <span className="font-extrabold text-emerald-400 text-xs">
                        ₹{plan.price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Transaction Info */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-orange-400" />
              <span>2. Payment & Transaction Details:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Amount */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Plan Amount (₹):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Transaction Mode */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Payment Mode:
                </label>
                <select
                  value={transactionMode}
                  onChange={(e) => setTransactionMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors"
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value} className="bg-slate-900 text-white">
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction ID / Reference */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Transaction ID / Reference (UTR / Txn ID / Receipt No):
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. UPI-123456789012 or UTR-98765432"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Notes / Remarks (Optional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Payment verified via GPay, store approved"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Plan Summary Preview */}
          {selectedPlan && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-500/30 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-orange-400 font-bold block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {selectedPlan.name} ({durationDays} Days Duration)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Product Quota: <strong className="text-white">{selectedPlan.productLimit} Devices</strong> • Valid until:{' '}
                  <strong className="text-emerald-400">{formattedExpiry}</strong>
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Total Amount</span>
                <span className="text-base font-black text-white">₹{amount}</span>
              </div>
            </div>
          )}
          </div>

          {/* Action Buttons - Pinned Bottom */}
          <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-end gap-3 bg-slate-950/90 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoading || !selectedPlanId}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Store & Saving Transaction...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Store & Save Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
