import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/cart');
      set({ cart: data.cart, loading: false });
    } catch { set({ loading: false }); }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      set({ cart: data.cart });
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/item/${productId}`, { quantity });
      set({ cart: data.cart });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  },

  removeItem: async (productId) => {
    try {
      const { data } = await api.delete(`/cart/item/${productId}`);
      set({ cart: data.cart });
      toast.success('Removed from cart');
    } catch {}
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ cart: { items: [] } });
    } catch {}
  },

  getCount: () => {
    const { cart } = get();
    return cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
  },

  getSubtotal: () => {
    const { cart } = get();
    return cart?.items?.reduce((acc, i) => {
      const price = i.product?.discountPrice || i.product?.price || 0;
      return acc + price * i.quantity;
    }, 0) || 0;
  },
}));

export default useCartStore;
