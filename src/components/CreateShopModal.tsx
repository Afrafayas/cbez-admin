import React, { useState } from 'react';
import { SubscriptionPlan } from '../types';
import { X, Store, CreditCard, Save } from 'lucide-react';

interface CreateShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shopData: any) => Promise<void>;
  subscriptionPlans: SubscriptionPlan[];
  isLoading: boolean;
}

export const CreateShopModal: React.FC<CreateShopModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subscriptionPlans,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kochi');
  const [category, setCategory] = useState('Mobiles & Tablets');
  const [aadhaarNumber, setAadhaarNumber] = useState('123456789012');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500');
  const [subscriptionPlanId, setSubscriptionPlanId] = useState(
    subscriptionPlans[0]?.id || ''
  );
  const [latitude, setLatitude] = useState(9.9312);
  const [longitude, setLongitude] = useState(76.2673);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      shopName: name,
      name: ownerName,
      ownerName,
      email: email.trim() || `seller.${Date.now()}@mlx.com`,
      password,
      phone,
      whatsapp: whatsapp || phone,
      address,
      city,
      district: 'Ernakulam',
      country: 'India',
      category,
      aadhaarNumber,
      panNumber,
      profileImage,
      latitude,
      longitude,
      subscriptionPlanId: subscriptionPlanId || subscriptionPlans[0]?.id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-slate-950">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register New Dealer / Shop</h3>
              <p className="text-xs text-slate-400">Create seller profile and assign initial subscription plan.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Subscription Plan Selection - Mandatory Admin Option */}
          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-2">
            <label className="block text-xs font-bold text-orange-300 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-orange-400" />
              Assign Subscription Plan *
            </label>
            <select
              value={subscriptionPlanId}
              onChange={(e) => setSubscriptionPlanId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-orange-500/40 text-white focus:outline-none focus:border-orange-400"
            >
              {subscriptionPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — Limit: {plan.productLimit} Products (Price: ₹{plan.price})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Dealer product listing limit is determined by the selected subscription plan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                placeholder="e.g. Mobiles World Kochi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                placeholder="e.g. Rahul Kumar"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                placeholder="+919876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                placeholder="+919876543210"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                placeholder="e.g. store@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Default Password *</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City Location *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                placeholder="e.g. Kochi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Category *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                placeholder="e.g. Mobiles & Tablets"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Business Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
              placeholder="e.g. Shop 12, Marine Drive, Kochi"
            />
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
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isLoading ? 'Creating Dealer...' : 'Create Dealer Shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
