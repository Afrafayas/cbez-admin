import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Save,
  ArrowLeft,
  Globe,
  Phone,
  Mail,
  MapPin,
  Edit3,
  X,
  RefreshCw,
  Server,
  ExternalLink,
} from 'lucide-react';
import { fetchPlatformSettings, updatePlatformSettings } from '../services/adminApi';

interface SettingsViewProps {
  onShowToast: (message: string, type?: 'success' | 'error') => void;
  onBackToShops?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast, onBackToShops }) => {
  const [platformName, setPlatformName] = useState('MLX Used Gadgets Directory');
  const [website, setWebsite] = useState('https://mlxmarket.in');
  const [supportPhone, setSupportPhone] = useState('+91 7902613259');
  const [supportEmail, setSupportEmail] = useState('support@mlxmarket.in');
  const [address, setAddress] = useState('Kochi, Kerala, India');

  // Commented section fallback states
  const [autoVerifyShops, setAutoVerifyShops] = useState(false);
  const [maxProductsPerShop, setMaxProductsPerShop] = useState(50);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Backup state to cancel editing
  const [backupData, setBackupData] = useState({
    platformName: '',
    website: '',
    supportPhone: '',
    supportEmail: '',
    address: '',
  });

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPlatformSettings();
      if (data) {
        const nameVal = data.platformName || 'MLX Used Gadgets Directory';
        const webVal = data.website || data.websiteLink || 'https://mlxmarket.in';
        const phoneVal = data.supportPhone || data.phone || '+91 7902613259';
        const emailVal = data.supportEmail || data.email || 'support@mlxmarket.in';
        const addrVal = data.address || 'Kochi, Kerala, India';

        setPlatformName(nameVal);
        setWebsite(webVal);
        setSupportPhone(phoneVal);
        setSupportEmail(emailVal);
        setAddress(addrVal);

        setBackupData({
          platformName: nameVal,
          website: webVal,
          supportPhone: phoneVal,
          supportEmail: emailVal,
          address: addrVal,
        });
      }
    } catch (err: any) {
      console.error('Failed to load platform settings:', err);
      onShowToast(err.message || 'Failed to load platform settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleStartEdit = () => {
    setBackupData({
      platformName,
      website,
      supportPhone,
      supportEmail,
      address,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setPlatformName(backupData.platformName);
    setWebsite(backupData.website);
    setSupportPhone(backupData.supportPhone);
    setSupportEmail(backupData.supportEmail);
    setAddress(backupData.address);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updatePlatformSettings({
        platformName,
        website,
        supportPhone,
        supportEmail,
        address,
      });

      if (updated) {
        setPlatformName(updated.platformName || platformName);
        setWebsite(updated.website || updated.websiteLink || website);
        setSupportPhone(updated.supportPhone || updated.phone || supportPhone);
        setSupportEmail(updated.supportEmail || updated.email || supportEmail);
        setAddress(updated.address || address);
      }

      setIsEditing(false);
      onShowToast('Platform settings updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error saving platform settings:', err);
      onShowToast(err.message || 'Failed to update platform settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl bg-slate-900/60 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {onBackToShops && (
              <button
                type="button"
                onClick={onBackToShops}
                className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer shrink-0"
                title="Back to Shops"
                aria-label="Back to Shops"
              >
                <ArrowLeft className="w-4 h-4 text-orange-400" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Platform Settings & Controls</h2>
              <p className="text-xs text-slate-400">Configure global marketplace behavior, contact details, and platform identity.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isEditing ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Details
              </button>
            )}

            <button
              type="button"
              onClick={loadSettings}
              disabled={isLoading || isSaving}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Settings"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Platform Identity & Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                MLX Platform Details & Identity
              </h3>
              {isEditing && (
                <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                  Editing Mode Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Platform Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-orange-400" />
                  Platform Name
                </label>
                <input
                  type="text"
                  value={platformName}
                  disabled={!isEditing}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="e.g. MLX Used Gadgets Directory"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isEditing
                      ? 'glass-input text-white border-orange-500/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50'
                      : 'bg-slate-950/40 border border-white/5 text-slate-300 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Website Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-400" />
                    Website Link
                  </span>
                  {!isEditing && website && (
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
                    >
                      Visit <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={website}
                    disabled={!isEditing}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://mlxmarket.in"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                      isEditing
                        ? 'glass-input text-white border-orange-500/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50'
                        : 'bg-slate-950/40 border border-white/5 text-slate-300 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Support Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  Support Mobile Number
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  disabled={!isEditing}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+91 7902613259"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isEditing
                      ? 'glass-input text-white border-orange-500/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50'
                      : 'bg-slate-950/40 border border-white/5 text-slate-300 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Support Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-400" />
                  Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  disabled={!isEditing}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@mlxmarket.in"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isEditing
                      ? 'glass-input text-white border-orange-500/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50'
                      : 'bg-slate-950/40 border border-white/5 text-slate-300 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  Official Address
                </label>
                <input
                  type="text"
                  value={address}
                  disabled={!isEditing}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kochi, Kerala, India"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isEditing
                      ? 'glass-input text-white border-orange-500/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50'
                      : 'bg-slate-950/40 border border-white/5 text-slate-300 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SHOP & INVENTORY GUIDELINES SECTION (COMMENTED OUT AS REQUESTED)
              ========================================================================= */}
          {/*
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
          */}

          {/* Action Footer */}
          {isEditing && (
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
