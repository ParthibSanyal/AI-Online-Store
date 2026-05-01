// Cart.jsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import useCartStore from '../../context/cartStore';
import { EmptyState } from '../../components/common/LoadingScreen';

export function Cart() {
  const navigate = useNavigate();
  const { cart, fetchCart, updateItem, removeItem, clearCart, getSubtotal } = useCartStore();
  useEffect(() => { fetchCart(); }, []);
  const subtotal = getSubtotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  if (!cart?.items?.length) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        message="Add some products to your cart to get started."
        action={<Link to="/products" className="btn-primary">Browse Products</Link>}
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-8">Shopping Cart ({cart.items.length})</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => {
            if (!item.product) return null;
            const price = item.product.discountPrice || item.product.price;
            return (
              <div key={item.product._id} className="card p-4 flex gap-4 items-center">
                <Link to={`/products/${item.product._id}`}>
                  <img
                    src={item.product.images?.[0]?.url || `https://picsum.photos/seed/${item.product._id}/100/100`}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 line-clamp-1">{item.product.name}</Link>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">₹{price?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <button onClick={() => updateItem(item.product._id, item.quantity - 1)} className="btn-icon w-7 h-7">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateItem(item.product._id, item.quantity + 1)} className="btn-icon w-7 h-7">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-bold text-primary-600 dark:text-primary-400 w-20 text-right">₹{(price * item.quantity)?.toLocaleString()}</p>
                <button onClick={() => removeItem(item.product._id)} className="btn-icon text-red-400 hover:text-red-500 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Shipping</span><span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-primary-600 dark:text-primary-400">₹{total.toLocaleString()}</span>
              </div>
            </div>
            {shipping > 0 && <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">Add ₹{(500 - subtotal).toLocaleString()} more for free shipping!</p>}
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/products" className="btn-ghost w-full text-center mt-3 text-sm block">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Cart;
