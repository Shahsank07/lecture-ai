import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, Sparkles, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { getAllNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../db';
import './NotificationsModal.css';

export default function NotificationsModal({ isOpen, onClose, role = 'student', user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = user || { role };

  const loadNotifications = async () => {
    try {
      const data = await getAllNotifications(currentUser);
      setNotifications(data || []);
    } catch (e) {
      console.warn('Failed to load notifications:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsRead(currentUser);
    setNotifications(prev => prev.map(n => ({ ...n, unread: false, read: true })));
  };

  const handleClearNotification = async (id) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notif-dropdown-backdrop" onClick={onClose}>
      <div className="notif-dropdown-panel animate-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="notif-dropdown-header">
          <div className="notif-header-title">
            <Bell size={18} className="notif-bell-icon" />
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="notif-unread-pill">{unreadCount} New</span>
            )}
          </div>

          <div className="notif-header-actions">
            {unreadCount > 0 && (
              <button className="btn-mark-read" onClick={handleMarkAllAsRead} title="Mark all notifications as read">
                <Check size={14} />
                <span>Mark Read</span>
              </button>
            )}
            <button className="btn-notif-close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="notif-dropdown-list">
          {notifications.length === 0 ? (
            <div className="notif-empty-state">
              <Check size={32} color="#10B981" />
              <p>No new notifications right now.</p>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                You'll receive alerts when new assignments, notes, or announcements are published.
              </span>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item-row ${n.unread ? 'unread' : ''}`}>
                <div className={`notif-dot-indicator ${n.type || 'notice'}`} />
                <div className="notif-content-area">
                  <div className="notif-row-top">
                    <h4 className="notif-item-title">{n.title}</h4>
                    <span className="notif-item-time">{n.time || 'Just now'}</span>
                  </div>
                  <p className="notif-item-desc">{n.desc || n.content || ''}</p>
                </div>
                <button
                  className="btn-delete-notif"
                  onClick={() => handleClearNotification(n.id)}
                  title="Dismiss notification"
                >
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="notif-dropdown-footer">
          <span>Real-time lecture alerts & academic updates</span>
        </div>
      </div>
    </div>
  );
}
