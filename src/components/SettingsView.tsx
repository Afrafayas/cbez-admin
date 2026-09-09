import React, { useState } from 'react';
import { Settings, Shield, Bell, Server, Database, Key, Save, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [platformName, setPlatformName] = useState('MLX Used Gadgets Directory');
  const [supportPhone, setSupportPhone] = useState('+91 7902613259');
  const [autoVerifyShops, setAutoVerifyShops] = useState(false);
  const [maxProductsPerShop, setMaxProductsPerShop] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onShowToast('Platform settings updated successfully!', 'success');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl bg-slate-900/60 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Platform Settings & Controls</h2>
            <p className="text-xs text-slate-400">Configure global marketplace behavior, shop rules, and backend API parameters.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              General Platform Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Support Contact Hotline</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shop Rules */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Shop & Inventory Guidelines
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">Auto-Verify Newly Registered Shops</div>
                  <div className="text-[11px] text-slate-400">If enabled, new shops will not require manual admin verification.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoVerifyShops(!autoVerifyShops)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    autoVerifyShops ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                      autoVerifyShops ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">Max Products Listing per Shop</div>
                  <div className="text-[11px] text-slate-400">Limit max product listings standard seller accounts can create.</div>
                </div>
                <input
                  type="number"
                  value={maxProductsPerShop}
                  onChange={(e) => setMaxProductsPerShop(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 rounded-xl glass-input text-xs text-white text-center"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
