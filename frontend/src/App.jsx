import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/authStore';
import { useThemeStore } from './context/stores';

// Layouts
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';
import SellerLayout from './components/layout/SellerLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Customer Pages
import Home from './pages/customer/Home';
import Products from './pages/customer/Products';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import Wishlist from './pages/customer/Wishlist';
import Profile from './pages/customer/Profile';
import Notifications from './pages/customer/Notifications';
import SearchResults from './pages/customer/SearchResults';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminCoupons from './pages/admin/Coupons';

// Seller Pages
import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import SellerOrders from './pages/seller/Orders';
import SellerInventory from './pages/seller/Inventory';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';

import LoadingScreen, { LoadingScreen as LS } from './components/common/LoadingScreen';
import ChatBot from './components/common/ChatBot';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <LoadingScreen />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'seller') return <Navigate to="/seller" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  const { init } = useAuthStore();
  const { dark, setDark } = useThemeStore();

  useEffect(() => {
    init();
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' },
          duration: 3000,
        }}
      />
      <Routes>
        {/* Public Auth */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="cart" element={<ProtectedRoute allowedRoles={['customer']}><Cart /></ProtectedRoute>} />
          <Route path="checkout" element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute allowedRoles={['customer']}><Orders /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute allowedRoles={['customer']}><OrderDetail /></ProtectedRoute>} />
          <Route path="wishlist" element={<ProtectedRoute allowedRoles={['customer']}><Wishlist /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute allowedRoles={['customer']}><Profile /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>

        {/* Seller Routes */}
        <Route path="/seller" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><SellerLayout /></ProtectedRoute>}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="inventory" element={<SellerInventory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global AI Chatbot */}
      <ChatBot />
    </BrowserRouter>
  );
}
