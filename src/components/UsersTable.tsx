import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Users, Search, Edit2, Trash2, Mail, Phone, Shield, Store, UserCheck, Calendar, History } from 'lucide-react';

interface UsersTableProps {
  users: UserAccount[];
  onEdit: (user: UserAccount) => void;
  onDelete: (user: UserAccount) => void;
  onViewLogs?: (userId: string, userName: string) => void;
  searchTerm: string;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onEdit,
  onDelete,
  onViewLogs,
  searchTerm,
}) => {
  const [filterRole, setFilterRole] = useState<'all' | 'customer' | 'seller' | 'admin'>('all');

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch =
      searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm));

    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'seller':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1.5 w-fit">
            <Store className="w-3 h-3" />
            Seller
          </span>
        );
      case 'admin':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 w-fit">
            <Shield className="w-3 h-3 text-purple-400" />
            Admin
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 w-fit">
            <UserCheck className="w-3 h-3 text-blue-400" />
            Customer
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Header Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            User Accounts Directory
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {filteredUsers.length} Users
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage user roles, customer profiles, and seller credentials across Cbez.
          </p>
        </div>

        {/* Filter Role Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterRole === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Roles ({users.length})
          </button>
          <button
            onClick={() => setFilterRole('customer')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterRole === 'customer'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customers ({users.filter((u) => u.role === 'customer').length})
          </button>
          <button
            onClick={() => setFilterRole('seller')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterRole === 'seller'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sellers ({users.filter((u) => u.role === 'seller').length})
          </button>
          <button
            onClick={() => setFilterRole('admin')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterRole === 'admin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admins ({users.filter((u) => u.role === 'admin').length})
          </button>
        </div>
      </div>

      {/* Main Users Table Container */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/50 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                <th className="px-5 py-4">User Details</th>
                <th className="px-5 py-4">Contact Info</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Linked Shop</th>
                <th className="px-5 py-4">Registered Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="text-base font-semibold text-slate-300">No User Accounts Found</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No user accounts matched your search criteria or role filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* User Name & Initial */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-orange-400 transition-colors">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-400 font-mono text-[11px] truncate max-w-[150px]">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span>{user.email || 'No email provided'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{user.phone || 'No phone provided'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-5 py-4">{getRoleBadge(user.role)}</td>

                    {/* Linked Shop info */}
                    <td className="px-5 py-4">
                      {user.shop ? (
                        <div>
                          <div className="font-semibold text-xs text-orange-300 flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            {user.shop.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {user.shop.city} • {user.shop.category}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-normal">N/A</span>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onViewLogs && (
                          <button
                            onClick={() => onViewLogs(user.id, user.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors cursor-pointer"
                            title="View User Activity History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onEdit(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Edit User Account"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
