import { useEffect } from 'react';
import { Bell, Check, Package, CreditCard, Tag, Info } from 'lucide-react';
import { useNotifStore } from '../../context/stores';
import { EmptyState } from '../../components/common/LoadingScreen';

const TYPE_ICONS = {
  order: Package,
  payment: CreditCard,
  promotion: Tag,
  system: Info,
  review: Bell,
};

export default function Notifications() {
  const { notifications, unread, fetch, markRead, markAllRead } = useNotifStore();
  useEffect(() => { fetch(); }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500 mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1">
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="You're all caught up!" />
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                className={`card p-4 flex gap-4 items-start cursor-pointer hover:border-primary-200 dark:hover:border-primary-800 transition-all ${!n.isRead ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
