import React, { useState } from 'react';
import { Search, RefreshCw, Bell, ShieldCheck, Server, Menu, X } from 'lucide-react';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  setSearchTerm,
  onRefresh,
  isLoading,
  onOpenMobileMenu,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="glass-panel sticky top-0 z-30 px-4 sm:px-6 py-3.5 border-b border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile Left Section: Hamburger Menu & Mobile Brand Logo */}
        <div className="flex items-center gap-2.5 md:hidden">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-orange-400" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-base text-white tracking-tight">MLX <span className="text-orange-500 font-semibold text-xs">ADMIN</span></div>
          </div>
        </div>

        {/* Global Desktop Search Bar */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shops by name, owner, city or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl glass-input text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="sm:hidden p-2 rounded-xl glass-panel text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Search Bar"
          >
            {isMobileSearchOpen ? <X className="w-4 h-4 text-orange-400" /> : <Search className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Backend Connectivity Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <Server className="w-3.5 h-3.5" />
            <span>Backend Connected</span>
          </div>

          {/* Refresh Data Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl glass-panel glass-panel-hover text-slate-300 text-xs font-semibold hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-xl glass-panel text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Field Input */}
      {isMobileSearchOpen && (
        <div className="relative sm:hidden animate-fade-in pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Search shops, owners, cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-200 placeholder:text-slate-500 bg-slate-900/90"
          />
        </div>
      )}
    </header>
  );
};
