import { useState, useEffect } from 'react';
import { ExternalLink, BookOpen, Video, FileText, Globe, Code, ArrowLeft, Bookmark } from 'lucide-react';
import { getAllSavedResources, saveResource, deleteSavedResource } from '../db';
import { Card, Button, Badge } from './ui';
import './ResourcesPage.css';

const DEMO_RESOURCES = [
  {
    id: '1',
    title: 'GeeksforGeeks – Binary Search Tree Tutorial',
    category: 'Article',
    subject: 'Data Structures',
    description: 'Comprehensive guide covering BST operations, insertion, deletion, and searching algorithms with code samples.',
    url: 'https://www.geeksforGeeks.org/binary-search-tree-data-structure/',
    icon: <Globe size={20} className="icon-green" />
  },
  {
    id: '2',
    title: 'MIT OpenCourseWare – Introduction to Algorithms',
    category: 'Courseware',
    subject: 'Computer Science',
    description: 'Lecture notes, recitations, and video lectures on algorithms, dynamic programming, and graph theory.',
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/',
    icon: <BookOpen size={20} className="icon-purple" />
  },
  {
    id: '3',
    title: 'DBMS Normalization Explained (1NF, 2NF, 3NF, BCNF)',
    category: 'Documentation',
    subject: 'Database Management',
    description: 'Step-by-step tutorial explaining database normalization rules with real-world table examples.',
    url: 'https://www.guru99.com/database-normalization.html',
    icon: <FileText size={20} className="icon-blue" />
  },
  {
    id: '4',
    title: 'Operating Systems – Process Scheduling Algorithms',
    category: 'Guide',
    subject: 'Operating Systems',
    description: 'Detailed analysis of FCFS, SJF, Priority, and Round Robin process scheduling algorithms with Gantt charts.',
    url: 'https://www.tutorialspoint.com/operating_system/os_process_scheduling_algorithms.htm',
    icon: <Code size={20} className="icon-orange" />
  },
  {
    id: '5',
    title: 'Khan Academy – Machine Learning & Neural Networks',
    category: 'Video Lecture',
    subject: 'Artificial Intelligence',
    description: 'Interactive visual lessons explaining gradient descent, backpropagation, and CNN architecture.',
    url: 'https://www.khanacademy.org/',
    icon: <Video size={20} className="icon-pink" />
  },
  {
    id: '6',
    title: 'MDN Web Docs – JavaScript Async/Await & Promises',
    category: 'Reference',
    subject: 'Web Development',
    description: 'Official documentation for asynchronous programming patterns, event loop mechanics, and error handling.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Async_functions',
    icon: <Globe size={20} className="icon-teal" />
  }
];

function ResourcesPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    async function loadSaved() {
      try {
        const saved = await getAllSavedResources();
        setSavedIds(saved.map(s => s.id));
      } catch (err) {
        console.error("Failed to load saved resources:", err);
      }
    }
    loadSaved();
  }, []);

  const categories = ['All', 'Saved', 'Article', 'Courseware', 'Documentation', 'Guide', 'Video Lecture', 'Reference'];

  const filteredResources = selectedCategory === 'Saved'
    ? DEMO_RESOURCES.filter(r => savedIds.includes(r.id))
    : selectedCategory === 'All' 
      ? DEMO_RESOURCES 
      : DEMO_RESOURCES.filter(r => r.category === selectedCategory);

  const handleOpenResource = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleToggleSave = async (e, res) => {
    e.stopPropagation();
    if (savedIds.includes(res.id)) {
      await deleteSavedResource(res.id);
      setSavedIds(prev => prev.filter(id => id !== res.id));
    } else {
      await saveResource({ id: res.id, title: res.title, url: res.url, savedAt: new Date().toISOString() });
      setSavedIds(prev => [...prev, res.id]);
    }
  };

  return (
    <div className="resources-page page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div>
            <h1>Curated Resources</h1>
            <p>Access high-quality study materials, documentation, and external references</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="resources-tabs">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`res-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat} {cat === 'Saved' && `(${savedIds.length})`}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="resources-grid">
        {filteredResources.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textCenter: 'center', color: 'var(--text-tertiary)' }}>
            No resources found for category "{selectedCategory}".
          </div>
        ) : (
          filteredResources.map(res => {
            const isSaved = savedIds.includes(res.id);
            return (
              <Card key={res.id} className="resource-card" interactive onClick={() => handleOpenResource(res.url)}>
                <div className="resource-card-header">
                  <div className="res-icon-wrapper">
                    {res.icon}
                  </div>
                  <div className="res-badges" style={{ alignItems: 'center' }}>
                    <Badge variant="neutral" size="sm">{res.subject}</Badge>
                    <button 
                      className="bookmark-btn" 
                      onClick={(e) => handleToggleSave(e, res)}
                      style={{ background: 'none', border: 'none', color: isSaved ? '#635bff' : 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                      title={isSaved ? 'Remove Bookmark' : 'Save Resource'}
                    >
                      <Bookmark size={18} fill={isSaved ? '#635bff' : 'none'} />
                    </button>
                  </div>
                </div>

                <h3 className="res-title">{res.title}</h3>
                <p className="res-desc">{res.description}</p>

                <div className="res-card-footer">
                  <span className="res-link-text">Open Resource</span>
                  <ExternalLink size={16} className="ext-link-icon" />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ResourcesPage;
