import React, { useState, useEffect } from 'react';
import { Shop, SubscriptionPlan } from '../types';
import { X, Store, Phone, MessageSquare, MapPin, Tag, Star, ShieldCheck, Save, CreditCard } from 'lucide-react';

interface EditShopModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedShop: Partial<Shop> & { subscriptionPlanId?: string }) => Promise<void>;
  subscriptionPlans?: SubscriptionPlan[];
  isLoading: boolean;
}

export const EditShopModal: React.FC<EditShopModalProps> = ({
  shop,
  isOpen,
  onClose,
  onSave,
  subscriptionPlans = [],
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [verified, setVerified] = useState(false);
  const [rating, setRating] = useState(4.5);
  const [subscriptionPlanId, setSubscriptionPlanId] = useState('');

  useEffect(() => {
    if (shop) {
      setName(shop.name || '');
      setOwnerName(shop.ownerName || '');
      setPhone(shop.phone || '');
      setWhatsapp(shop.whatsapp || '');
      setAddress(shop.address || '');
      setCity(shop.city || '');
      setCategory(shop.category || '');
      setVerified(shop.verified ?? false);
      setRating(shop.rating ?? 4.5);
      const currentPlanId = shop.subscription?.planId || shop.subscription?.plan?.id || '';
      setSubscriptionPlanId(currentPlanId);
    }
  }, [shop]);

  if (!isOpen || !shop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      name,
      ownerName,
      phone,
      whatsapp,
      address,
      city,
      category,
      verified,
      rating,
      subscriptionPlanId: subscriptionPlanId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-slate-950">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Edit Store & Assign Subscription</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Update shop details, location, and assigned plan.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Subscription Plan Selection Option */}
          {subscriptionPlans.length > 0 && (
            <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-1.5">
              <label className="block text-xs font-bold text-orange-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-orange-400" />
                Assign Subscription Plan *
              </label>
              <select
                value={subscriptionPlanId}
                onChange={(e) => setSubscriptionPlanId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-orange-500/40 text-white focus:outline-none focus:border-orange-400"
              >
                <option value="">-- Keep Current Plan --</option>
                {subscriptionPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — Limit: {plan.productLimit} Products (Price: ₹{plan.price})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-orange-400" />
                Store Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                City Location *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Primary Store Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Business Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Rating (1.0 to 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-xl glass-input"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${verified ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-semibold text-white">Verification Status</div>
                  <div className="text-[10px] text-slate-400">{verified ? 'Store Verified' : 'Unverified Store'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerified(!verified)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  verified ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                    verified ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
