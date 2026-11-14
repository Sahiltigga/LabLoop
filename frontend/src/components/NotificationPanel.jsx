import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, X, Clock } from 'lucide-react';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-100">
      {/* Header */}
      <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-primary-600" />
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary-600 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-medium text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading && (
          <p className="p-4 text-xs text-center text-slate-400">Updating notifications...</p>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No notifications at this time.
          </div>
        )}

        {!loading &&
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`p-3.5 text-xs transition-colors cursor-pointer ${
                n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70 font-medium'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h5 className="font-semibold text-slate-900">{n.title}</h5>
                <span className="text-[10px] text-slate-400 flex items-center space-x-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                {n.message}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NotificationPanel;

