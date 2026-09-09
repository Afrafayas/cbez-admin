import React from 'react';
import { Search, RefreshCw, Bell, ShieldCheck, Server } from 'lucide-react';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ searchTerm, setSearchTerm, onRefresh, isLoading }) => {
  return (
    <header className="glass-panel sticky top-0 z-30 px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
      {/* Mobile Title */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="font-bold text-lg text-white">MLX Admin</div>
      </div>

      {/* Global Search Bar */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search shops by name, owner, city or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl glass-input text-slate-200 placeholder:text-slate-500"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <Server className="w-3.5 h-3.5" />
          <span>Backend Connected</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel glass-panel-hover text-slate-300 text-xs font-semibold hover:text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl glass-panel text-slate-400 hover:text-white transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
        </button>
      </div>
    </header>
  );
};
