import { create } from 'zustand';
import api from '../utils/api';

// Theme Store
export const useThemeStore = create((set) => ({
  dark: localStorage.getItem('darkMode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches,
  toggle: () => set((state) => {
    const next = !state.dark;
    localStorage.setItem('darkMode', String(next));
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return { dark: next };
  }),
  setDark: (val) => {
    localStorage.setItem('darkMode', String(val));
    if (val) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    set({ dark: val });
  },
}));

// Notification Store
export const useNotifStore = create((set, get) => ({
  notifications: [],
  unread: 0,

  fetch: async () => {
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.notifications, unread: data.unread });
    } catch {}
  },

  markRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((s) => ({
        notifications: s.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
        unread: Math.max(0, s.unread - 1),
      }));
    } catch {}
  },

  markAllRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((s) => ({ notifications: s.notifications.map(n => ({ ...n, isRead: true })), unread: 0 }));
    } catch {}
  },

  push: (notif) => set((s) => ({
    notifications: [notif, ...s.notifications].slice(0, 30),
    unread: s.unread + 1,
  })),
}));

// Wishlist Store
export const useWishlistStore = create((set, get) => ({
  wishlist: null,

  fetch: async () => {
    try {
      const { data } = await api.get('/wishlist');
      set({ wishlist: data.wishlist });
    } catch {}
  },

  toggle: async (productId) => {
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      set({ wishlist: data.wishlist });
      return data.added;
    } catch { return false; }
  },

  isInWishlist: (productId) => {
    const { wishlist } = get();
    return wishlist?.products?.some(p => (p._id || p) === productId) || false;
  },
}));
