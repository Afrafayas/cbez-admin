import React from 'react';
import { LayoutDashboard, Store, ShoppingBag, Users, Settings, ShieldCheck, LogOut, History, Server, CheckCircle2, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'shops', label: 'Manage Shops', icon: Store, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'products', label: 'Products Directory', icon: ShoppingBag },
    { id: 'users', label: 'User Accounts', icon: Users },
    { id: 'activity', label: 'Activity Logs', icon: History },
  ];

  const systemNavItems = [
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="space-y-5 flex-1 flex flex-col justify-between">
      <div className="space-y-5">
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-white">
                MLX<span className="text-orange-500 text-sm font-semibold ml-1">ADMIN</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Shop Control Center</div>
            </div>
          </div>

          {/* Close button for Mobile Drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 md:hidden cursor-pointer"
              aria-label="Close Mobile Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Main Navigation</div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-inner font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full animate-pulse-glow">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">System</div>
          <nav className="space-y-1">
            {systemNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-inner font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Status Quick Widget */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-orange-400" />
              System Status
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Operational
            </span>
          </div>
          <p className="text-[11px] text-slate-400">NestJS API & MongoDB database connected.</p>
          {pendingCount > 0 && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-semibold">{pendingCount} Action Required</span>
              <button
                onClick={() => handleTabClick('shops')}
                className="text-orange-400 hover:underline font-bold text-[10px] cursor-pointer"
              >
                Review Now →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin User Card Footer */}
      <div className="pt-4 border-t border-white/10 mt-4">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 border border-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/20 shrink-0">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">Super Admin</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Session
            </div>
          </div>
          <button
            onClick={() => {
              if (onLogout) onLogout();
              if (onCloseMobile) onCloseMobile();
            }}
            className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Log out from Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/10 h-screen sticky top-0 p-4 hidden md:flex flex-col justify-between shrink-0 z-40 overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile Overlay Navigation Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer Body */}
          <aside className="relative w-72 max-w-[85vw] glass-panel bg-slate-950/95 border-r border-white/10 h-full p-4 flex flex-col justify-between z-10 shadow-2xl overflow-y-auto animate-fade-in">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
