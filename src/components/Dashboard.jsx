import { useState, useEffect, useMemo } from 'react';
import { 
  Play, Bookmark, Calendar as CalendarIcon, ArrowRight, Zap, 
  BookOpen, Clock, Layers, Flame, Radio, TrendingUp, Sparkles, CheckCircle2
} from 'lucide-react';
import { getClassesBySubject } from '../db';
import { formatDuration, formatDate } from '../utils/helpers';
import { Card, Button, Badge } from './ui';
import CreateSubjectModal from './CreateSubjectModal';
import './Dashboard.css';

function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return formatDate(dateStr);
}

function Dashboard({ user, subjects, searchQuery = '', onNavigate, onRefresh }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allLectures, setAllLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const loaded = [];
      for (const sub of subjects) {
        const classes = await getClassesBySubject(sub.id);
        classes.forEach((c) => {
          loaded.push({ ...c, subjectName: sub.name, subjectEmoji: sub.emoji });
        });
      }
      loaded.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllLectures(loaded);
      setIsLoading(false);
    }
    loadData();
  }, [subjects]);

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allLectures.filter(l => 
      (l.title && l.title.toLowerCase().includes(q)) ||
      (l.subjectName && l.subjectName.toLowerCase().includes(q)) ||
      (l.transcript && l.transcript.toLowerCase().includes(q))
    );
  }, [allLectures, searchQuery]);

  const activeLecture = useMemo(() => {
    return allLectures.find(l => l.status === 'recording' || l.status === 'paused') || allLectures[0] || null;
  }, [allLectures]);

  const totalStudyHours = useMemo(() => {
    const totalSecs = allLectures.reduce((acc, l) => acc + (l.duration || 0), 0);
    return (totalSecs / 3600).toFixed(1);
  }, [allLectures]);

  const userName = user?.name ? user.name.split(' ')[0] : 'Shashank';

  return (
    <div className="dashboard-page">
      {/* Greeting Header */}
      <div className="dashboard-greeting">
        <h1>Good Evening, {userName}! 👋</h1>
        <p>Ready to continue your learning journey?</p>
      </div>

      {/* Search Results Overlay / Section if searchQuery is present */}
      {searchQuery.trim() !== '' && (
        <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--primary-500)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
            Search Results for "{searchQuery}" ({filteredSearchResults.length})
          </h3>
          {filteredSearchResults.length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>No matching lectures or topics found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredSearchResults.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => onNavigate(item.status === 'completed' ? `notes:${item.id}` : `session:${item.id}`)}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{item.title}</span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>{item.subjectName}</span>
                  </div>
                  <Button variant="primary" size="sm">Open</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 4 Statistics Cards matching Reference Image */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <BookOpen size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Lectures</span>
            <div className="stat-value-row">
              <span className="stat-value">{allLectures.length || 24}</span>
              <span className="stat-badge success">+3 this week</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Hours Learned</span>
            <div className="stat-value-row">
              <span className="stat-value">{totalStudyHours > 0 ? totalStudyHours : '18.6'}</span>
              <span className="stat-badge success">+4.2 this week</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper deep-purple">
            <Layers size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Topics Covered</span>
            <div className="stat-value-row">
              <span className="stat-value">128</span>
              <span className="stat-badge success">+15 this week</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <Flame size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Study Streak</span>
            <div className="stat-value-row">
              <span className="stat-value">7</span>
              <span className="stat-subtext">days in a row</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 columns + Right Insights Panel */}
      <div className="dashboard-main-grid">
        {/* Left / Middle Column Container */}
        <div className="grid-left-col">
          {/* Row 1: Continue Learning & Upcoming Schedule */}
          <div className="row-continue-schedule">
            {/* Continue Learning Card */}
            <Card className="continue-learning-card">
              <div className="card-header-simple">
                <h3>Continue Learning</h3>
              </div>
              <div className="continue-body">
                <div className="continue-media">
                  <div className="media-placeholder">
                    <button 
                      className="play-circle-btn" 
                      onClick={() => activeLecture ? onNavigate(activeLecture.status === 'completed' ? `notes:${activeLecture.id}` : `session:${activeLecture.id}`) : onNavigate('lectures')}
                    >
                      <Play size={22} fill="white" />
                    </button>
                    <span className="duration-pill">{activeLecture?.duration ? formatDuration(activeLecture.duration) : '42:36'}</span>
                  </div>
                </div>
                <div className="continue-details">
                  <h4 className="continue-title">{activeLecture?.subjectName || 'Data Structures – Trees'}</h4>
                  <p className="continue-subtitle">{activeLecture?.title || 'Binary Trees and Its Types'}</p>
                  
                  <div className="continue-progress-bar-wrapper">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '65%' }}></div>
                    </div>
                    <span className="progress-text">65% Completed</span>
                  </div>

                  <div className="continue-actions">
                    <Button 
                      variant="primary" 
                      size="md"
                      onClick={() => activeLecture ? onNavigate(activeLecture.status === 'completed' ? `notes:${activeLecture.id}` : `session:${activeLecture.id}`) : onNavigate('lectures')}
                    >
                      Continue Lecture
                    </Button>
                    <button 
                      className="icon-action-btn" 
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Lecture"}
                      onClick={() => setIsBookmarked(prev => !prev)}
                      style={{ color: isBookmarked ? '#635bff' : 'var(--text-secondary)' }}
                    >
                      <Bookmark size={18} fill={isBookmarked ? '#635bff' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upcoming Schedule Card */}
            <Card className="upcoming-schedule-card">
              <div className="card-header-between">
                <h3>Upcoming Schedule</h3>
                <button className="link-action" onClick={() => onNavigate('calendar')}>View Calendar</button>
              </div>
              <div className="schedule-list">
                <div className="schedule-item">
                  <div className="schedule-icon purple">
                    <BookOpen size={16} />
                  </div>
                  <div className="schedule-info">
                    <span className="schedule-title">DBMS Lecture</span>
                    <span className="schedule-sub">Normalization (3NF)</span>
                  </div>
                  <span className="schedule-time">Today, 6:00 PM</span>
                </div>

                <div className="schedule-item">
                  <div className="schedule-icon blue">
                    <Sparkles size={16} />
                  </div>
                  <div className="schedule-info">
                    <span className="schedule-title">AI Quiz</span>
                    <span className="schedule-sub">Data Structures</span>
                  </div>
                  <span className="schedule-time">Tomorrow, 10:00 AM</span>
                </div>

                <div className="schedule-item">
                  <div className="schedule-icon purple">
                    <BookOpen size={16} />
                  </div>
                  <div className="schedule-info">
                    <span className="schedule-title">OS Lecture</span>
                    <span className="schedule-sub">Process Scheduling</span>
                  </div>
                  <span className="schedule-time">Fri, 6:00 PM</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Row 2: AI Insights (From Your Recent Lectures) */}
          <Card className="ai-insights-card">
            <div className="card-header-between">
              <h3>AI Insights <span className="sub-header">(From Your Recent Lectures)</span></h3>
              <button className="link-action" onClick={() => onNavigate('notes')}>View All →</button>
            </div>
            <div className="insights-grid">
              <div className="insight-box green">
                <div className="insight-header">
                  <Zap size={16} className="insight-icon green" />
                  <span className="insight-tag green">Topic Detected</span>
                </div>
                <h4 className="insight-title">Tree Traversal</h4>
                <span className="insight-footer">Detected 15 min ago</span>
              </div>

              <div className="insight-box orange">
                <div className="insight-header">
                  <Sparkles size={16} className="insight-icon orange" />
                  <span className="insight-tag orange">Important Concept</span>
                </div>
                <h4 className="insight-title">Inorder Traversal</h4>
                <span className="insight-footer">Marked as important</span>
              </div>

              <div className="insight-box pink">
                <div className="insight-header">
                  <BookOpen size={16} className="insight-icon pink" />
                  <span className="insight-tag pink">Recommended</span>
                </div>
                <h4 className="insight-title">GeeksforGeeks Article</h4>
                <span className="insight-footer">Binary Tree Tutorial</span>
              </div>

              <div className="insight-box purple">
                <div className="insight-header">
                  <TrendingUp size={16} className="insight-icon purple" />
                  <span className="insight-tag purple">AI Suggestion</span>
                </div>
                <h4 className="insight-title">Revise these 3 topics</h4>
                <span className="insight-footer">Before next lecture</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column / Panel (Live Insights & Study Progress) */}
        <div className="grid-right-col">
          {/* Live Lecture Insights */}
          <Card className="live-insights-card">
            <div className="card-header-between">
              <h3>Live Lecture Insights</h3>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onNavigate('live-lecture')}
                leftIcon={<Radio size={14} />}
                className="go-live-btn"
              >
                Go Live
              </Button>
            </div>

            <div className="live-topic-section">
              <div className="topic-meta">
                <span className="meta-label">Current Topic</span>
                <span className="meta-label text-right">Confidence</span>
              </div>
              <div className="topic-val-row">
                <h4 className="topic-name">Binary Search Tree</h4>
                <span className="confidence-num">92%</span>
              </div>
              <div className="progress-bar small">
                <div className="progress-fill green" style={{ width: '92%' }}></div>
              </div>

              <div className="time-detected-row">
                <div>
                  <span className="lbl">Time</span>
                  <span className="val">32:15</span>
                </div>
                <div className="text-right">
                  <span className="lbl">Detected</span>
                  <span className="val">5 min ago</span>
                </div>
              </div>
            </div>

            <div className="key-points-section">
              <span className="kp-label">Key Points</span>
              <ul className="kp-list">
                <li>• BST Property</li>
                <li>• Insertion in BST</li>
                <li>• Deletion in BST</li>
                <li>• Time Complexity</li>
              </ul>
            </div>

            <button className="view-timeline-btn" onClick={() => onNavigate('notes')}>
              View Full Timeline →
            </button>
          </Card>

          {/* Study Progress Card */}
          <Card className="study-progress-card">
            <h3>Study Progress</h3>
            <div className="donut-section">
              <div className="donut-container">
                <svg width="120" height="120" viewBox="0 0 36 36" className="donut-svg">
                  <path
                    className="donut-ring"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1e263b"
                    strokeWidth="3.8"
                  />
                  <path
                    className="donut-segment"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#donut-grad)"
                    strokeWidth="3.8"
                    strokeDasharray="75, 100"
                  />
                  <defs>
                    <linearGradient id="donut-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#635bff" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="donut-text">
                  <span className="percent">75%</span>
                  <span className="lbl">Overall Progress</span>
                </div>
              </div>

              <div className="donut-legend">
                <div className="legend-item">
                  <span className="dot green"></span>
                  <span className="lbl">Completed</span>
                  <span className="val">18</span>
                </div>
                <div className="legend-item">
                  <span className="dot yellow"></span>
                  <span className="lbl">In Progress</span>
                  <span className="val">6</span>
                </div>
                <div className="legend-item">
                  <span className="dot red"></span>
                  <span className="lbl">Not Started</span>
                  <span className="val">4</span>
                </div>
              </div>
            </div>

            <Button 
              variant="secondary" 
              size="md" 
              fullWidth 
              onClick={() => onNavigate('progress')}
              className="view-progress-btn"
            >
              View Progress →
            </Button>
          </Card>
        </div>
      </div>

      {showCreateModal && (
        <CreateSubjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;