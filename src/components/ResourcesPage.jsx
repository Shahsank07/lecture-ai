import { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink, BookOpen, Video, FileText, Globe, Code,
  ArrowLeft, Bookmark, FolderOpen, Plus, Trash2, UploadCloud,
  FileCheck, Sparkles, Download
} from 'lucide-react';
import { getAllSavedResources, deleteSavedResource, toggleBookmark, isBookmarked } from '../db';
import { Card, Button, Badge } from './ui';
import UploadNotesModal from './Faculty/UploadNotesModal';
import './ResourcesPage.css';

function ResourcesPage({ user, onNavigate }) {
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedMap, setBookmarkedMap] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const isFaculty = user?.role === 'faculty';

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSavedResources();
      setResources(data || []);

      // Check bookmarks
      const bMap = {};
      if (data && data.length > 0) {
        for (const item of data) {
          bMap[item.id] = await isBookmarked(item.id, user?.id);
        }
      }
      setBookmarkedMap(bMap);
    } catch (err) {
      console.warn("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleToggleBookmark = async (e, res) => {
    e.stopPropagation();
    const isNowBookmarked = await toggleBookmark({
      id: res.id,
      title: res.title,
      type: 'resource',
      subject: res.subject || res.classGroup || 'Study Material',
      description: res.description || res.overview || 'Uploaded course resource',
      url: res.url,
      targetView: 'resources'
    }, user?.id);

    setBookmarkedMap(prev => ({
      ...prev,
      [res.id]: isNowBookmarked
    }));
  };

  const handleDeleteResource = async (e, id) => {
    e.stopPropagation();
    await deleteSavedResource(id);
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const handleOpenResource = (res) => {
    if (res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Build categories from actual data
  const dynamicCategories = ['All'];
  resources.forEach(r => {
    const cat = r.category || (r.files && r.files.length > 0 ? 'PDF Document' : 'Study Guide');
    if (!dynamicCategories.includes(cat)) dynamicCategories.push(cat);
  });
  dynamicCategories.push('Bookmarked');

  const filteredResources = resources.filter(res => {
    const isBookmarkedItem = !!bookmarkedMap[res.id];
    const itemCat = res.category || (res.files && res.files.length > 0 ? 'PDF Document' : 'Study Guide');
    const matchesCat =
      selectedCategory === 'All' ? true :
      selectedCategory === 'Bookmarked' ? isBookmarkedItem :
      itemCat === selectedCategory;

    const matchesSearch =
      (res.title && res.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.subject && res.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.topic && res.topic.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="resources-page page-container">
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-header-left">
          <button className="back-btn" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div>
            <h1>Learning Resources & Study Materials</h1>
            <p>Access syllabus handouts, lecture PDFs, and external learning references</p>
          </div>
        </div>

        {isFaculty && (
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)'
            }}
          >
            <UploadCloud size={16} />
            <span>Upload PDF & Study Material</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div className="resources-tabs">
          {dynamicCategories.map(cat => (
            <button 
              key={cat}
              className={`res-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search study materials..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              background: '#0E1322',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              color: '#F8FAFC',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="resources-grid">
        {filteredResources.length === 0 ? (
          <div className="empty-resources-box" style={{ gridColumn: '1 / -1' }}>
            <FolderOpen size={48} className="empty-icon" />
            <h3>No resources yet</h3>
            <p>
              {searchQuery
                ? 'No resources match your search query.'
                : isFaculty
                  ? 'Upload syllabus PDFs, lecture slides, or external reference links for your students.'
                  : 'Your faculty has not uploaded any study resources or PDFs for your classes yet.'}
            </p>
            {isFaculty && !searchQuery && (
              <button
                onClick={() => setShowUploadModal(true)}
                style={{
                  marginTop: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <UploadCloud size={16} />
                <span>Upload First Resource</span>
              </button>
            )}
          </div>
        ) : (
          filteredResources.map(res => {
            const isSaved = !!bookmarkedMap[res.id];
            const hasFiles = res.files && res.files.length > 0;
            const hasExtracted = res.extractedPoints && res.extractedPoints.length > 0;

            return (
              <Card
                key={res.id}
                className="resource-card"
                interactive
                onClick={() => handleOpenResource(res)}
              >
                <div className="resource-card-header">
                  <div className="res-icon-wrapper">
                    {hasFiles ? (
                      <FileCheck size={20} color="#A855F7" />
                    ) : res.url?.includes('video') ? (
                      <Video size={20} color="#38BDF8" />
                    ) : (
                      <BookOpen size={20} color="#10B981" />
                    )}
                  </div>
                  <div className="res-badges" style={{ alignItems: 'center' }}>
                    <Badge variant="neutral" size="sm">{res.subject || 'General'}</Badge>
                    <button 
                      className="bookmark-btn" 
                      onClick={(e) => handleToggleBookmark(e, res)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isSaved ? '#A855F7' : '#64748B',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title={isSaved ? 'Remove Bookmark' : 'Bookmark Resource'}
                    >
                      <Bookmark size={18} fill={isSaved ? '#A855F7' : 'none'} />
                    </button>
                    {isFaculty && (
                      <button
                        onClick={(e) => handleDeleteResource(e, res.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Delete Resource"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="res-title">{res.title}</h3>
                <p className="res-desc">{res.description || res.overview || 'Course learning document and study notes.'}</p>

                {/* Attached PDF Files */}
                {hasFiles && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0 8px' }}>
                    {res.files.map((f, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: '#94A3B8',
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        <FileText size={13} color="#C084FC" />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.name}
                        </span>
                        {f.size && <span style={{ fontSize: '10px', color: '#64748B' }}>{f.size}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Extracted points highlight tag */}
                {hasExtracted && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: '#C084FC',
                    background: 'rgba(168, 85, 247, 0.12)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    alignSelf: 'flex-start'
                  }}>
                    <Sparkles size={12} />
                    <span>{res.extractedPoints.length} AI Key Takeaways Extracted</span>
                  </div>
                )}

                <div className="res-card-footer">
                  <span className="res-link-text">
                    {res.url ? 'Open Resource Link' : (hasFiles ? 'Download / View Handout' : 'Study Resource')}
                  </span>
                  {res.url ? (
                    <ExternalLink size={16} className="ext-link-icon" />
                  ) : hasFiles ? (
                    <Download size={15} color="#A855F7" />
                  ) : null}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Upload Modal for Faculty */}
      {showUploadModal && (
        <UploadNotesModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploaded={(newRes) => {
            setResources(prev => [newRes, ...prev]);
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}

export default ResourcesPage;
