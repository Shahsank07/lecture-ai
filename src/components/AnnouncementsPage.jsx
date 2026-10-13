import { useState, useEffect, useCallback } from 'react';
import {
  Megaphone, Clock, Download, Search, Pin, CheckCircle2,
  User, Plus, Trash2, X, Send
} from 'lucide-react';
import { getAllAnnouncements, saveAnnouncement, deleteAnnouncement } from '../db';
import './AnnouncementsPage.css';

export default function AnnouncementsPage({ user, onNavigate }) {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readAnnouncements, setReadAnnouncements] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('department');
  const [isPinned, setIsPinned] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await getAllAnnouncements(user);
      setAnnouncements(data || []);
    } catch (err) {
      console.warn('Error loading announcements:', err);
    }
  }, [user]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleToggleRead = (id) => {
    setReadAnnouncements(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const categoryMap = {
      exams: { label: 'Exam Alert', badge: 'red-badge', color: '#EF4444' },
      assignments: { label: 'Coursework', badge: 'amber-badge', color: '#F59E0B' },
      events: { label: 'Event', badge: 'green-badge', color: '#10B981' },
      department: { label: 'Department', badge: 'blue-badge', color: '#3B82F6' }
    };

    const catMeta = categoryMap[newCategory] || categoryMap.department;

    const created = await saveAnnouncement({
      title: newTitle.trim(),
      content: newContent.trim() || 'Please check the course portal for details.',
      category: newCategory,
      categoryLabel: catMeta.label,
      badgeClass: catMeta.badge,
      color: catMeta.color,
      pinned: isPinned,
      author: user?.name ? `${user.name} (${user.department || 'Faculty'})` : 'Faculty Instructor',
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: 'Just now'
    });

    setAnnouncements(prev => [created, ...prev]);
    setNewTitle('');
    setNewContent('');
    setShowCreateModal(false);
  };

  const handleDeleteAnnouncement = async (e, id) => {
    e.stopPropagation();
    await deleteAnnouncement(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const filteredAnnouncements = announcements.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.text && item.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const isFaculty = user?.role === 'faculty';

  return (
    <div className="announcements-page-root">
      {/* Page Header */}
      <div className="ann-page-header">
        <div className="ann-header-left">
          <div className="ann-header-icon-wrap">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="ann-title">Campus & Course Announcements</h1>
            <p className="ann-subtitle">Official notifications, exam updates, and academic bulletins</p>
          </div>
        </div>

        {isFaculty && (
          <button
            className="btn-create-announcement"
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#0F172A',
              fontWeight: 700,
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Plus size={16} />
            <span>Create Announcement</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="ann-controls-row">
        <div className="ann-filter-pills">
          <button
            className={`ann-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Notices ({announcements.length})
          </button>
          <button
            className={`ann-pill ${selectedCategory === 'exams' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('exams')}
          >
            Exam Alerts
          </button>
          <button
            className={`ann-pill ${selectedCategory === 'assignments' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('assignments')}
          >
            Coursework
          </button>
          <button
            className={`ann-pill ${selectedCategory === 'events' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('events')}
          >
            Events & Seminars
          </button>
          <button
            className={`ann-pill ${selectedCategory === 'department' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('department')}
          >
            Department
          </button>
        </div>

        <div className="ann-search-input-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search notifications, circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Announcements Stream */}
      {filteredAnnouncements.length === 0 ? (
        <div className="empty-announcements-box">
          <Megaphone size={40} className="empty-icon" />
          <h3>No announcements yet</h3>
          <p>
            {searchQuery
              ? 'No announcements match your search query.'
              : isFaculty
                ? 'Broadcast notices, exam schedules, or coursework circulars to your enrolled students.'
                : 'Your faculty has not published any announcements or notices yet.'}
          </p>
          {isFaculty && !searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                marginTop: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F59E0B',
                color: '#0F172A',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>Create Announcement</span>
            </button>
          )}
        </div>
      ) : (
        <div className="announcements-stream">
          {filteredAnnouncements.map((ann) => {
            const isRead = readAnnouncements.has(ann.id);
            return (
              <div key={ann.id} className={`announcement-full-card ${isRead ? 'is-read' : ''}`}>
                <div className="ann-card-header">
                  <div className="ann-card-meta-left">
                    <span className={`ann-category-tag ${ann.badgeClass || 'amber-badge'}`}>
                      {ann.categoryLabel || ann.category || 'Notice'}
                    </span>
                    {ann.pinned && (
                      <span className="ann-pinned-badge">
                        <Pin size={12} />
                        Pinned
                      </span>
                    )}
                    <span className="ann-author-text">
                      <User size={13} />
                      {ann.author || 'Faculty Instructor'}
                    </span>
                  </div>
                  <div className="ann-card-time-badge">
                    <Clock size={13} />
                    <span>{ann.time || ann.date}</span>
                    {isFaculty && (
                      <button
                        onClick={(e) => handleDeleteAnnouncement(e, ann.id)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', marginLeft: '8px' }}
                        title="Delete Announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="ann-card-title">{ann.title}</h2>
                <p className="ann-card-body">{ann.content || ann.text}</p>

                <div className="ann-card-footer">
                  <div className="ann-footer-left">
                    {ann.attachment ? (
                      <button
                        className="ann-attachment-btn"
                        onClick={() => alert(`Downloading attachment: ${ann.attachment}`)}
                      >
                        <Download size={14} />
                        <span>{ann.attachment}</span>
                      </button>
                    ) : (
                      <span className="ann-date-stamp">Published: {ann.date || 'Recent'}</span>
                    )}
                  </div>

                  <div className="ann-footer-actions">
                    <button
                      className={`btn-toggle-read ${isRead ? 'read' : ''}`}
                      onClick={() => handleToggleRead(ann.id)}
                    >
                      <CheckCircle2 size={14} />
                      <span>{isRead ? 'Mark as Unread' : 'Mark as Read'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Faculty Create Announcement Modal */}
      {showCreateModal && (
        <div
          className="faculty-modal-overlay"
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="faculty-modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0E1322',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxWidth: '520px',
              width: '100%',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Megaphone size={20} color="#F59E0B" />
                <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '18px' }}>Publish New Announcement</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mid-Term Exam Schedule Published"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#13192B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#13192B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="exams">Exam Alert</option>
                  <option value="assignments">Coursework / Assignment</option>
                  <option value="events">Events & Guest Lectures</option>
                  <option value="department">Department Notice</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                  Announcement Details
                </label>
                <textarea
                  rows="4"
                  placeholder="Write message for students..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#13192B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                />
                <label htmlFor="pinNotice" style={{ fontSize: '13px', color: '#CBD5E1', cursor: 'pointer' }}>
                  Pin this announcement to the top
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: '#F59E0B',
                    border: 'none',
                    color: '#0F172A',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Send size={15} />
                  <span>Publish Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
