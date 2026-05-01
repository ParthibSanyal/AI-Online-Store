import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, ShoppingBag, Package, Tag,
  LogOut, Menu, X, Sparkles, Bell, Sun, Moon, ChevronRight
} from 'lucide-react';
import useAuthStore from '../../context/authStore';
import { useThemeStore } from '../../context/stores';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/products', label: 'Products', icon: ShoppingBag },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (link) => link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-300`}>
        <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-gray-800 gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex-shrink-0 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && <span className="font-display font-bold gradient-text">Admin</span>}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              title={!sidebarOpen ? link.label : ''}
              className={`sidebar-link ${isActive(link) ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className={`sidebar-link text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full ${!sidebarOpen ? 'justify-center px-2' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-icon">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 dark:text-white">
              {links.find(l => isActive(l))?.label || 'Admin Panel'}
            </h1>
          </div>
          <button onClick={toggle} className="btn-icon">
            {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name[0]}
            </div>
            <span className="text-sm font-medium hidden md:block">{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
