import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, Tag, Check, ChevronRight, Smartphone, X, QrCode } from 'lucide-react';
import api from '../../utils/api';
import useCartStore from '../../context/cartStore';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];

// UPI Modal Component
function UPIModal({ order, onClose, onSuccess }) {
  const [upiId, setUpiId] = useState('');
  const [upiMethod, setUpiMethod] = useState('qr'); // 'qr' or 'id'
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // Mark order as pending UPI payment
      await api.put(`/orders/${order._id}/status`, {
        status: 'confirmed',
        message: `UPI payment initiated${upiMethod === 'id' ? ` via ${upiId}` : ' via QR code'}`,
      });
      toast.success('Order placed! Complete payment using UPI.');
      onSuccess();
    } catch (err) {
      toast.error('Failed to confirm order');
    } finally { setConfirming(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold text-lg">Pay via UPI</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Amount */}
          <div className="text-center mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500 text-sm">Amount to Pay</p>
            <p className="text-3xl font-bold gradient-text">₹{order?.total?.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Order #{order?.orderNumber}</p>
          </div>

          {/* Method Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setUpiMethod('qr')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${upiMethod === 'qr' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
              <QrCode className="w-4 h-4" /> QR Code
            </button>
            <button
              onClick={() => setUpiMethod('id')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${upiMethod === 'id' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
              <Smartphone className="w-4 h-4" /> UPI ID
            </button>
          </div>

          {upiMethod === 'qr' ? (
            <div className="text-center">
              {/* QR Code Placeholder - Replace src with your actual QR code image */}
              <div className="w-56 h-56 mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 mb-4">
                <QrCode className="w-16 h-16 text-gray-400 mb-2" />
                <p className="text-xs text-gray-400 text-center px-4">
                  QR code will appear here.<br />
                  Replace with your payment QR image.
                </p>
                {/* 
                  TO ADD YOUR QR CODE:
                  Replace the div above with:
                  <img src="/qr-code.png" alt="UPI QR Code" className="w-56 h-56 object-contain" />
                  And place your QR image in frontend/public/qr-code.png
                */}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Scan with any UPI app</p>
              <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                <span>GPay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>BHIM</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Enter UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="input mb-3"
              />
              <p className="text-xs text-gray-400">Example: name@okaxis, name@ybl, name@paytm</p>
            </div>
          )}

          {/* Warning */}
          <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
            ⚠️ After completing UPI payment, click "I've Paid" to confirm your order.
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleConfirm}
              disabled={confirming || (upiMethod === 'id' && !upiId.includes('@'))}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {confirming ? 'Confirming...' : "I've Paid ✓"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, getSubtotal } = useCartStore();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(user?.addresses?.find(a => a.isDefault) || {});
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [upiOrder, setUpiOrder] = useState(null); // for UPI modal
  const subtotal = getSubtotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal - couponDiscount + shipping;

  const handleApplyCoupon = async () => {
    try {
      const { data } = await api.post('/payments/apply-coupon', { code: couponCode, subtotal });
      setCouponDiscount(data.discount);
      toast.success(`Coupon applied! ₹${data.discount} off`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.pincode) {
      toast.error('Please fill shipping address');
      setStep(0); return;
    }
    setPlacing(true);
    try {
      const items = cart.items.map(i => ({ product: i.product._id, quantity: i.quantity }));
      const { data } = await api.post('/orders', {
        items,
        shippingAddress: { ...address, name: user.name, phone: user.phone || address.phone },
        paymentMethod: paymentMethod === 'upi' ? 'cod' : paymentMethod, // UPI handled separately
        couponCode: couponDiscount > 0 ? couponCode : undefined,
      });

      if (paymentMethod === 'cod') {
        toast.success('Order placed! Pay on delivery.');
        navigate(`/orders/${data.order._id}`);
        return;
      }

      if (paymentMethod === 'upi') {
        setUpiOrder(data.order);
        setPlacing(false);
        return;
      }

      if (paymentMethod === 'razorpay') {
        const rpRes = await api.post('/payments/razorpay/create', { orderId: data.order._id });
        const options = {
          key: rpRes.data.keyId,
          amount: rpRes.data.amount,
          currency: rpRes.data.currency,
          name: 'AI Shop',
          description: `Order #${data.order.orderNumber}`,
          order_id: rpRes.data.razorpayOrderId,
          handler: async (response) => {
            await api.post('/payments/razorpay/verify', { ...response, orderId: data.order._id });
            toast.success('Payment successful!');
            navigate(`/orders/${data.order._id}`);
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: '#6366f1' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setPlacing(false);
        return;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart?.items?.length) { navigate('/cart'); return null; }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* UPI Modal */}
      <AnimatePresence>
        {upiOrder && (
          <UPIModal
            order={upiOrder}
            onClose={() => setUpiOrder(null)}
            onSuccess={() => {
              setUpiOrder(null);
              navigate(`/orders/${upiOrder._id}`);
            }}
          />
        )}
      </AnimatePresence>

      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${i === step ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><Truck className="w-5 h-5 text-primary-500" /> Shipping Address</h2>
              {user?.addresses?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Saved Addresses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.addresses.map((addr, i) => (
                      <button
                        key={i}
                        onClick={() => setAddress(addr)}
                        className={`text-left p-4 rounded-xl border-2 transition-all text-sm ${JSON.stringify(address) === JSON.stringify(addr) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}
                      >
                        <p className="font-semibold">{addr.label || 'Address'}</p>
                        <p className="text-gray-600 dark:text-gray-400">{addr.street}, {addr.city}</p>
                        <p className="text-gray-500">{addr.state} - {addr.pincode}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Or enter a new address</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'phone', label: 'Phone', placeholder: '9876543210', full: false },
                  { key: 'street', label: 'Street Address', placeholder: '123 Main Street', full: true },
                  { key: 'city', label: 'City', placeholder: 'Mumbai', full: false },
                  { key: 'state', label: 'State', placeholder: 'Maharashtra', full: false },
                  { key: 'pincode', label: 'Pincode', placeholder: '400001', full: false },
                  { key: 'country', label: 'Country', placeholder: 'India', full: false },
                ].map(({ key, label, placeholder, full }) => (
                  <div key={key} className={full ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={address[key] || ''}
                      onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))}
                      className="input"
                    />
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="btn-primary mt-6 flex items-center gap-2">
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary-500" /> Payment Method</h2>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'razorpay', label: 'Razorpay', sub: 'Cards, UPI, Net Banking, Wallets', emoji: '💳' },
                  { value: 'upi', label: 'Pay via UPI', sub: 'QR Code or UPI ID (GPay, PhonePe, Paytm)', emoji: '📱' },
                  { value: 'stripe', label: 'Stripe', sub: 'International cards', emoji: '🌍' },
                  { value: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive', emoji: '💵' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                    <input type="radio" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="accent-primary-600" />
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.sub}</p>
                    </div>
                    {opt.value === 'upi' && (
                      <div className="flex gap-1 text-xs text-gray-400">
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">GPay</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">PhonePe</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Paytm</span>
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* UPI info box */}
              {paymentMethod === 'upi' && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">📱 How UPI payment works:</p>
                  <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside">
                    <li>Place order and a UPI payment window will open</li>
                    <li>Scan QR code or enter your UPI ID</li>
                    <li>Complete payment in your UPI app</li>
                    <li>Click "I've Paid" to confirm your order</li>
                  </ol>
                </div>
              )}

              {/* Coupon */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Coupon Code</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="input flex-1 uppercase"
                  />
                  <button onClick={handleApplyCoupon} className="btn-outline flex-shrink-0">Apply</button>
                </div>
                {couponDiscount > 0 && <p className="text-green-500 text-sm mt-2 font-medium">✓ ₹{couponDiscount} discount applied!</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-2">Review Order <ChevronRight className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="font-bold text-lg mb-6">Review Order</h2>
              <div className="space-y-3 mb-6">
                {cart.items.map(item => {
                  if (!item.product) return null;
                  const price = item.product.discountPrice || item.product.price;
                  return (
                    <div key={item.product._id} className="flex items-center gap-3">
                      <img src={item.product.images?.[0]?.url || `https://picsum.photos/seed/${item.product._id}/60/60`} className="w-12 h-12 rounded-lg object-cover" alt="" />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{(price * item.quantity).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Delivering to</span><span className="font-medium text-right max-w-[60%]">{address.street}, {address.city}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment</span>
                  <span className="font-medium capitalize flex items-center gap-1">
                    {paymentMethod === 'upi' ? '📱 UPI' : paymentMethod === 'razorpay' ? '💳 Razorpay' : paymentMethod === 'cod' ? '💵 Cash on Delivery' : '🌍 Stripe'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {placing ? 'Placing...' : `Place Order • ₹${total.toLocaleString()}`}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Subtotal ({cart.items.length} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Shipping</span><span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{couponDiscount}</span></div>}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between font-bold text-base">
                <span>Total</span><span className="text-primary-600 dark:text-primary-400">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
