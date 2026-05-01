import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);
  useEffect(() => {
    const t = setTimeout(fetchUsers, 400);
    return () => clearTimeout(t);
  }, [search]);

  const toggleStatus = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle`);
      setUsers(u => u.map(usr => usr._id === userId ? { ...usr, isActive: data.user.isActive } : usr));
      toast.success(data.user.isActive ? 'User activated' : 'User deactivated');
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total users</p>
      </div>
      <div className="card p-6">
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-40">
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="py-3"><div className="skeleton h-8 rounded" /></td></tr>
                ))
              ) : users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.avatar ? <img src={user.avatar} className="w-9 h-9 rounded-full object-cover" alt="" /> : user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'seller' ? 'badge-warning' : 'badge-primary'}`}>{user.role}</span>
                  </td>
                  <td className="py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleStatus(user._id)}
                      className={`btn-icon text-sm ${user.isActive ? 'text-red-400 hover:text-red-500' : 'text-green-500 hover:text-green-600'}`}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
