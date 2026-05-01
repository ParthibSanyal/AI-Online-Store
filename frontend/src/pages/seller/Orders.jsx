import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { OrderStatusBadge } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

const NEXT_STATUS = { placed: 'confirmed', confirmed: 'processing', processing: 'shipped', shipped: 'out_for_delivery', out_for_delivery: 'delivered' };

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/seller/orders${params}`).then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, [statusFilter]);

  const advance = async (orderId, currentStatus) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: next, message: `Status updated to ${next}` });
      setOrders(o => o.map(ord => ord._id === orderId ? { ...ord, orderStatus: next } : ord));
      toast.success(`Order marked as ${next.replace(/_/g, ' ')}`);
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} orders</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['', 'placed', 'confirmed', 'processing', 'shipped', 'delivered'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`badge cursor-pointer py-1.5 px-3 text-sm capitalize ${statusFilter === s ? 'badge-primary' : 'badge-gray'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="card p-6">
        {loading ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded" />)}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3">
                      <p className="font-mono text-xs text-primary-600 dark:text-primary-400">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3">{order.user?.name}</td>
                    <td className="py-3 text-gray-500">{order.items?.length} item(s)</td>
                    <td className="py-3 font-bold">₹{order.total?.toLocaleString()}</td>
                    <td className="py-3"><OrderStatusBadge status={order.orderStatus} /></td>
                    <td className="py-3">
                      {NEXT_STATUS[order.orderStatus] && (
                        <button onClick={() => advance(order._id, order.orderStatus)} className="btn-primary text-xs py-1.5 px-3">
                          Mark: {NEXT_STATUS[order.orderStatus]?.replace(/_/g, ' ')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No orders found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
