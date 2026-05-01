// Orders.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../../utils/api';
import { EmptyState, OrderStatusBadge } from '../../components/common/LoadingScreen';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const params = statusFilter ? `?status=${statusFilter}` : '';
        const { data } = await api.get(`/orders/my${params}`);
        setOrders(data.orders);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [statusFilter]);

  const statuses = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setStatusFilter('')} className={`badge cursor-pointer py-1.5 px-3 text-sm ${!statusFilter ? 'badge-primary' : 'badge-gray'}`}>All</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`badge cursor-pointer py-1.5 px-3 text-sm capitalize ${statusFilter === s ? 'badge-primary' : 'badge-gray'}`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" message="Start shopping to see your orders here." action={<Link to="/products" className="btn-primary">Browse Products</Link>} />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-5 flex items-center gap-4 group hover:border-primary-200 dark:hover:border-primary-800 transition-all">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.product?.images?.[0]?.url || `https://picsum.photos/seed/${item.product?._id || i}/60/60`} className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-gray-900" alt="" />
                ))}
                {order.items.length > 3 && <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold text-gray-500">+{order.items.length - 3}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.items.length} item(s) · {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">₹{order.total?.toLocaleString()}</p>
                <OrderStatusBadge status={order.orderStatus} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
export default Orders;
