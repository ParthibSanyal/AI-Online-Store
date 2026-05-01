import { useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import { OrderStatusBadge } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

const STATUSES = ['placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 30 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);
  useEffect(() => {
    const t = setTimeout(fetchOrders, 400);
    return () => clearTimeout(t);
  }, [search]);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status, message: `Status updated to ${status} by admin` });
      setOrders(o => o.map(ord => ord._id === orderId ? { ...ord, orderStatus: status } : ord));
      toast.success('Status updated!');
    } catch { toast.error('Update failed'); } finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Order Management</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total orders</p>
      </div>
      <div className="card p-6">
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search order number..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-48">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Payment</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                Array(8).fill(0).map((_, i) => <tr key={i}><td colSpan={7} className="py-3"><div className="skeleton h-8 rounded" /></td></tr>)
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3">
                    <p className="font-mono text-xs text-primary-600 dark:text-primary-400">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-3">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="py-3 text-gray-500">{order.items?.length} item(s)</td>
                  <td className="py-3 font-bold">₹{order.total?.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3"><OrderStatusBadge status={order.orderStatus} /></td>
                  <td className="py-3">
                    <div className="relative">
                      <select
                        value={order.orderStatus}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="input text-xs py-1.5 pr-6 appearance-none cursor-pointer w-36"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-400">No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
