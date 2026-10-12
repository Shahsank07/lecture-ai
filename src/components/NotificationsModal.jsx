import { useState } from 'react';
import { Bell, Check, Trash2, X, Sparkles, BookOpen, Clock, AlertCircle } from 'lucide-react';
import './NotificationsModal.css';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'Welcome to LectureAI! 🎓',
    desc: 'Record live lectures, invite students with lecture codes, and receive AI-synthesized notes instantly.',
    time: 'Just now',
    type: 'welcome',
    unread: true
  },
  {
    id: 'n-2',
    title: 'Live Lectures with Code Joining Active 🎙️',
    desc: 'Students can now enter teacher lecture codes to follow sessions live and receive notes automatically.',
    time: '10m ago',
    type: 'feature',
    unread: true
  },
  {
    id: 'n-3',
    title: 'Grok AI Engine Operational ✨',
    desc: 'xAI Grok-3-mini is ready to generate instant flashcards, quizzes, and lecture summaries.',
    time: '1h ago',
    type: 'ai',
    unread: true
  },
  {
    id: 'n-4',
    title: 'Academic Notice: Mid-Term Schedules Published 📢',
    desc: 'Check the Announcements section for updated examination hall seating and room allocations.',
    time: '2h ago',
    type: 'notice',
    unread: false
  }
];

export default function NotificationsModal({ isOpen, onClose, role = 'student' }) {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearNotification = (id) => {
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
              <button className="btn-mark-read" onClick={markAllAsRead} title="Mark all notifications as read">
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
              <p>You have caught up with all notifications!</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item-row ${n.unread ? 'unread' : ''}`}>
                <div className={`notif-dot-indicator ${n.type}`} />
                <div className="notif-content-area">
                  <div className="notif-row-top">
                    <h4 className="notif-item-title">{n.title}</h4>
                    <span className="notif-item-time">{n.time}</span>
                  </div>
                  <p className="notif-item-desc">{n.desc}</p>
                </div>
                <button
                  className="btn-delete-notif"
                  onClick={() => clearNotification(n.id)}
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
