import { useState, useEffect, useCallback } from 'react';
import {
  Bookmark, FileText, Video, FolderOpen, ArrowRight,
  Search, Trash2, ExternalLink, Calendar, BookOpen, Clock
} from 'lucide-react';
import { getAllBookmarks, deleteBookmark } from '../db';
import { formatDate } from '../utils/helpers';
import './BookmarksPage.css';

export default function BookmarksPage({ user, onNavigate }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'note' | 'lecture' | 'resource'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBookmarks(user?.id);
      setBookmarks(data || []);
    } catch (err) {
      console.warn('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    await deleteBookmark(id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleOpen = (item) => {
    if (item.targetView) {
      onNavigate(item.targetView);
    } else if (item.type === 'note') {
      onNavigate(`notes:${item.targetId || item.id}`);
    } else if (item.type === 'lecture') {
      onNavigate(`session:${item.targetId || item.id}`);
    } else if (item.type === 'resource') {
      if (item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      } else {
        onNavigate('resources');
      }
    } else {
      onNavigate('notes');
    }
  };

  const filteredBookmarks = bookmarks.filter(b => {
    const matchesTab = activeTab === 'all' || b.type === activeTab;
    const matchesSearch =
      (b.title && b.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.subject && b.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const notesCount = bookmarks.filter(b => b.type === 'note').length;
  const lecturesCount = bookmarks.filter(b => b.type === 'lecture').length;
  const resourcesCount = bookmarks.filter(b => b.type === 'resource').length;

  return (
    <div className="bookmarks-page-container">
      {/* Top Header */}
      <div className="bookmarks-header">
        <div className="bookmarks-header-left">
          <div className="bookmarks-icon-circle">
            <Bookmark size={24} />
          </div>
          <div>
            <h1 className="bookmarks-title">Saved Bookmarks</h1>
            <p className="bookmarks-subtitle">
              Quick access to your saved lecture notes, AI summaries, and study resources
            </p>
          </div>
        </div>
      </div>

      {/* Controls: Filter Pills & Search */}
      <div className="bookmarks-controls">
        <div className="bookmarks-tabs">
          <button
            className={`bookmark-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Items ({bookmarks.length})
          </button>
          <button
            className={`bookmark-tab-btn ${activeTab === 'note' ? 'active' : ''}`}
            onClick={() => setActiveTab('note')}
          >
            <FileText size={14} />
            <span>Notes ({notesCount})</span>
          </button>
          <button
            className={`bookmark-tab-btn ${activeTab === 'lecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('lecture')}
          >
            <Video size={14} />
            <span>Lectures ({lecturesCount})</span>
          </button>
          <button
            className={`bookmark-tab-btn ${activeTab === 'resource' ? 'active' : ''}`}
            onClick={() => setActiveTab('resource')}
          >
            <FolderOpen size={14} />
            <span>Resources ({resourcesCount})</span>
          </button>
        </div>

        <div className="bookmarks-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search saved bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bookmarks List / Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="empty-bookmarks-box">
          <div className="empty-bookmark-circle">
            <Bookmark size={36} color="#A855F7" />
          </div>
          <h3>{searchQuery ? 'No matching bookmarks found' : 'No Bookmarks Saved Yet'}</h3>
          <p>
            {searchQuery
              ? 'Try searching with different keywords or clear your query filter.'
              : 'Bookmark key concepts, AI summaries, or lecture materials to organize your study library.'}
          </p>
          {!searchQuery && (
            <div className="empty-bookmarks-actions">
              <button className="btn-explore-notes" onClick={() => onNavigate('notes')}>
                <FileText size={16} />
                <span>Browse Lecture Notes</span>
              </button>
              <button className="btn-explore-resources" onClick={() => onNavigate('resources')}>
                <FolderOpen size={16} />
                <span>Explore Resources</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bookmarks-grid">
          {filteredBookmarks.map((item) => (
            <div
              key={item.id}
              className={`bookmark-item-card type-${item.type || 'note'}`}
              onClick={() => handleOpen(item)}
            >
              <div className="bookmark-card-top">
                <span className={`bookmark-type-badge ${item.type || 'note'}`}>
                  {item.type === 'lecture' && <Video size={12} />}
                  {item.type === 'resource' && <FolderOpen size={12} />}
                  {(!item.type || item.type === 'note') && <FileText size={12} />}
                  <span>{item.type ? item.type.toUpperCase() : 'NOTE'}</span>
                </span>
                {item.subject && (
                  <span className="bookmark-subject-tag">{item.subject}</span>
                )}
                <button
                  className="btn-remove-bookmark"
                  onClick={(e) => handleRemove(e, item.id)}
                  title="Remove bookmark"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <h3 className="bookmark-item-title">{item.title}</h3>
              <p className="bookmark-item-desc">
                {item.description || item.overview || 'Saved study reference with AI summary.'}
              </p>

              <div className="bookmark-card-footer">
                <span className="bookmark-date">
                  <Calendar size={12} />
                  {formatDate(item.savedAt || item.date || new Date().toISOString())}
                </span>
                <span className="bookmark-action-link">
                  {item.type === 'resource' && item.url ? 'Open Resource' : 'View Notes'}
                  {item.type === 'resource' && item.url ? (
                    <ExternalLink size={13} />
                  ) : (
                    <ArrowRight size={13} />
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
