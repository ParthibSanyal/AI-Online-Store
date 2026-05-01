import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  initialized: false,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) return set({ loading: false, initialized: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, token, loading: false, initialized: true });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, token: null, loading: false, initialized: true });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requireOTP) return { requireOTP: true, userId: data.userId };
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, token: data.token });
    return { success: true, role: data.user.role };
  },

  register: async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, token: data.token });
    return { success: true, role: data.user.role };
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null });
  },

  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

  setDarkMode: async (dark) => {
    const { user } = get();
    if (user) {
      set((s) => ({ user: { ...s.user, preferences: { ...s.user.preferences, darkMode: dark } } }));
      await api.put('/users/profile', { preferences: { ...user.preferences, darkMode: dark } });
    }
  },
}));

export default useAuthStore;
