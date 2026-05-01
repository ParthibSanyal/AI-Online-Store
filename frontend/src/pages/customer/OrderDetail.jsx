import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, Check, X, MapPin, CreditCard } from 'lucide-react';
import api from '../../utils/api';
import { OrderStatusBadge } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by user' });
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
    finally { setCancelling(false); }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 space-y-4"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/orders" className="btn-ghost text-sm">← Back to Orders</Link>
      </div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Order #{order.orderNumber}</h1>
          <p className="text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.orderStatus} />
          {['placed', 'confirmed'].includes(order.orderStatus) && (
            <button onClick={handleCancel} disabled={cancelling} className="btn-danger text-sm py-2">
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-6">Order Tracking</h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${i <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-[10px] text-center text-gray-500 capitalize w-16 leading-tight">{s.replace(/_/g, ' ')}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentStep ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-primary-500" />
              <span>Tracking: <strong>{order.trackingNumber}</strong></span>
              {order.courier && <span className="text-gray-500">via {order.courier}</span>}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4 items-center">
                <img
                  src={item.product?.images?.[0]?.url || `https://picsum.photos/seed/${item.product?._id || i}/80/80`}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  alt={item.name}
                />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>-₹{order.discount}</span></div>}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-800"><span>Total</span><span className="text-primary-600 dark:text-primary-400">₹{order.total?.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-500" /> Shipping To</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.pincode}</p>
              {order.shippingAddress?.phone && <p>📞 {order.shippingAddress.phone}</p>}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary-500" /> Payment</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="capitalize font-medium">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-500' : order.paymentStatus === 'failed' ? 'text-red-500' : 'text-amber-500'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
          {order.statusHistory?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold mb-3">Status History</h3>
              <div className="space-y-3">
                {order.statusHistory.slice().reverse().map((h, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium capitalize">{h.status?.replace(/_/g, ' ')}</p>
                      <p className="text-gray-500">{h.message}</p>
                      <p className="text-gray-400">{new Date(h.at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
