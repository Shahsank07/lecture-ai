import { useState } from 'react';
import {
  Megaphone, Bell, Calendar, Clock, Download, Search,
  Filter, Tag, Pin, CheckCircle2, ChevronRight, FileText, User
} from 'lucide-react';
import './AnnouncementsPage.css';

export default function AnnouncementsPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readAnnouncements, setReadAnnouncements] = useState(new Set());

  const announcementsData = [
    {
      id: 'ann-1',
      title: 'Mid Sem Examinations Schedule & Seating Allotment',
      category: 'exams',
      categoryLabel: 'Exam Alert',
      color: '#EF4444',
      badgeClass: 'red-badge',
      pinned: true,
      author: 'Office of the Dean (Academics)',
      date: '19 May 2025',
      time: '2 hours ago',
      content: 'Mid semester examinations for B.Tech CSE (3rd, 4th and 6th Semesters) will commence from next Monday. Please review your hall ticket and room allocations on the student portal. Calculators are permitted only for Applied Mathematics and Discrete Math papers.',
      attachment: 'MidSem_Exam_Schedule_May2025.pdf'
    },
    {
      id: 'ann-2',
      title: 'Data Structures: Assignment 2 Problem Set Published',
      category: 'assignments',
      categoryLabel: 'Coursework',
      color: '#F59E0B',
      badgeClass: 'amber-badge',
      pinned: true,
      author: 'Dr. Alex Johnson (Dept. of Computer Science)',
      date: '18 May 2025',
      time: '1 day ago',
      content: 'The new problem set covering AVL Tree Rotations and B-Tree indexing algorithms has been published to the Assignments tab. Ensure all test cases in the starter code pass before submitting your final repository link.',
      attachment: 'DSA_Assignment_2_Specification.pdf'
    },
    {
      id: 'ann-3',
      title: 'Distinguished Guest Lecture: Modern LLMs & Agentic AI Systems',
      category: 'events',
      categoryLabel: 'Guest Lecture',
      color: '#10B981',
      badgeClass: 'green-badge',
      pinned: false,
      author: 'AI Research Club & CSE Dept',
      date: '17 May 2025',
      time: '2 days ago',
      content: 'Join Dr. Sarah Lin (Senior Research Scientist, Google DeepMind) for an interactive colloquium on multi-agent architectures and multimodal reasoning engines. Session will be held in Auditorium 2 and streamed live on LectureAI.',
      attachment: 'Guest_Lecture_Poster_AI.pdf'
    },
    {
      id: 'ann-4',
      title: 'DBMS Lab Server Maintenance Notice (Scheduled Downtime)',
      category: 'department',
      categoryLabel: 'Notice',
      color: '#3B82F6',
      badgeClass: 'blue-badge',
      pinned: false,
      author: 'Systems Administration & Computing Centre',
      date: '16 May 2025',
      time: '3 days ago',
      content: 'The PostgreSQL cluster hosting students laboratory databases will undergo scheduled storage upgrades this Saturday between 10:00 PM and 02:00 AM IST. Please export any unsaved queries or test schemas prior to the maintenance window.',
      attachment: null
    },
    {
      id: 'ann-5',
      title: 'Library Hours Extended for End-Semester Preparation',
      category: 'department',
      categoryLabel: 'Campus',
      color: '#8B5CF6',
      badgeClass: 'purple-badge',
      pinned: false,
      author: 'Central University Library',
      date: '15 May 2025',
      time: '4 days ago',
      content: 'The Central Library reading halls and digital workstation rooms will remain open 24x7 starting May 20 through June 15 to facilitate examination revisions. Wi-Fi credentials and printing facilities will be accessible round-the-clock.',
      attachment: null
    }
  ];

  const handleToggleRead = (id) => {
    setReadAnnouncements(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredAnnouncements = announcementsData.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
      </div>

      {/* Filter and Search Bar */}
      <div className="ann-controls-row">
        <div className="ann-filter-pills">
          <button
            className={`ann-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Notices ({announcementsData.length})
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
      <div className="announcements-stream">
        {filteredAnnouncements.map((ann) => {
          const isRead = readAnnouncements.has(ann.id);
          return (
            <div key={ann.id} className={`announcement-full-card ${isRead ? 'is-read' : ''}`}>
              <div className="ann-card-header">
                <div className="ann-card-meta-left">
                  <span className={`ann-category-tag ${ann.badgeClass}`}>
                    {ann.categoryLabel}
                  </span>
                  {ann.pinned && (
                    <span className="ann-pinned-badge">
                      <Pin size={12} />
                      Pinned
                    </span>
                  )}
                  <span className="ann-author-text">
                    <User size={13} />
                    {ann.author}
                  </span>
                </div>
                <div className="ann-card-time-badge">
                  <Clock size={13} />
                  <span>{ann.time}</span>
                </div>
              </div>

              <h2 className="ann-card-title">{ann.title}</h2>
              <p className="ann-card-body">{ann.content}</p>

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
                    <span className="ann-date-stamp">Published: {ann.date}</span>
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
    </div>
  );
}
