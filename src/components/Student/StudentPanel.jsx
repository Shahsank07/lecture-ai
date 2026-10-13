import { useState, useEffect } from 'react';
import {
  LayoutDashboard, BookOpen, Video, FileText, FolderOpen,
  ClipboardList, HelpCircle, Calendar, Megaphone, MessageSquare,
  Sparkles, TrendingUp, Bookmark, Settings, LogOut, Search,
  Bell, Play, Download, MoreVertical, Clock, MapPin,
  ChevronRight, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { getAllAssignments, getAllAnnouncements, getAllClasses, getJoinedLectures, getAllBookmarks } from '../../db';
import NotificationsModal from '../NotificationsModal';
import './StudentPanel.css';

export default function StudentPanel({
  user,
  subjects = [],
  onLogout,
  onNavigate,
  onOpenSettings
}) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const isDemo =
    user?.id === 'student-arjun-sharma' ||
    user?.email?.toLowerCase().includes('arjun.sharma@university.edu');

  const todaySchedule = isDemo ? [
    {
      id: 'sched-1',
      time: '10:00 AM',
      name: 'Data Structures',
      section: 'B.Tech CSE - 3rd Semester',
      room: 'Room 204',
      type: 'Lecture',
      typeClass: 'purple-tag'
    },
    {
      id: 'sched-2',
      time: '12:00 PM',
      name: 'Database Management Systems',
      section: 'B.Tech CSE - 4th Semester',
      room: 'Room 301',
      type: 'Lecture',
      typeClass: 'purple-tag'
    },
    {
      id: 'sched-3',
      time: '02:00 PM',
      name: 'Operating Systems',
      section: 'B.Tech CSE - 3rd Semester',
      room: 'Room 204',
      type: 'Lecture',
      typeClass: 'purple-tag'
    },
    {
      id: 'sched-4',
      time: '04:00 PM',
      name: 'Discrete Mathematics',
      section: 'B.Tech CSE - 2nd Semester',
      room: 'Room 102',
      type: 'Tutorial',
      typeClass: 'green-tag'
    }
  ] : [];

  const [studentAssignments, setStudentAssignments] = useState([]);
  const [studentAnnouncements, setStudentAnnouncements] = useState([]);
  const [studentLectures, setStudentLectures] = useState([]);
  const [bookmarksCount, setBookmarksCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const asgs = await getAllAssignments(user);
        setStudentAssignments(asgs || []);

        const anns = await getAllAnnouncements(user);
        setStudentAnnouncements(anns || []);

        const cls = await getAllClasses();
        const joined = await getJoinedLectures(user);
        const mergedMap = new Map();
        (cls || []).forEach(c => mergedMap.set(c.id, c));
        (joined || []).forEach(j => mergedMap.set(j.id, j));
        setStudentLectures(Array.from(mergedMap.values()));

        const bms = await getAllBookmarks(user?.id);
        setBookmarksCount((bms || []).length);
      } catch (e) {
        console.warn('StudentPanel data load:', e);
      }
    })();
  }, [user]);

  const recentLectures = studentLectures.slice(0, 5).map(l => {
    const sub = subjects.find(s => s.id === l.subjectId);
    return {
      id: l.id,
      title: l.title,
      course: sub?.name || l.subjectName || 'Lecture Session',
      date: l.date ? new Date(l.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
      duration: l.duration ? `${Math.floor(l.duration / 60)}:${String(l.duration % 60).padStart(2, '0')}` : '45:00',
      thumb: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80'
    };
  });

  const upcomingDeadlines = studentAssignments.map(a => ({
    id: a.id,
    title: a.title,
    course: a.course || a.classGroup || 'Coursework',
    due: a.dueDate,
    daysLeft: a.daysLeft || 'Due Soon',
    urgency: a.urgency || 'warning'
  }));

  const announcements = studentAnnouncements.map(a => ({
    id: a.id,
    title: a.title,
    desc: a.content || a.text || 'Important course notification.',
    time: a.time || a.date || 'Recent',
    color: a.color || '#F59E0B'
  }));

  const classesCount = subjects?.length || user?.enrolledClassesCount || 0;
  const lecturesCount = studentLectures.length;
  const assignmentsCount = studentAssignments.length;
  const pendingCount = studentAssignments.filter(a => a.status === 'pending').length;
  const progressPercent = studentLectures.length > 0 ? `${Math.min(100, studentLectures.length * 20)}%` : '0%';
  const progressSub = studentLectures.length > 0 ? 'Keep it up!' : 'Start learning';

  const handleNavClick = (viewId) => {
    setActiveNav(viewId);
    if (onNavigate) {
      if (viewId === 'dashboard') onNavigate('dashboard');
      else if (viewId === 'classes') onNavigate('classes');
      else if (viewId === 'lectures') onNavigate('lectures');
      else if (viewId === 'notes') onNavigate('notes');
      else if (viewId === 'resources') onNavigate('resources');
      else if (viewId === 'ai-assistant' || viewId === 'messages') onNavigate('ai-assistant');
      else if (viewId === 'progress') onNavigate('progress');
      else if (viewId === 'calendar') onNavigate('calendar');
      else if (viewId === 'assignments') onNavigate('assignments');
      else if (viewId === 'announcements') onNavigate('announcements');
      else if (viewId === 'quizzes') onNavigate('quizzes');
      else if (viewId === 'bookmarks') onNavigate('bookmarks');
    }
  };

  return (
    <div className="student-portal-layout">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="student-sidebar">
        {/* Brand */}
        <div className="student-sidebar-brand">
          <div className="sidebar-logo-hex">
            <div className="logo-hex-inner">
              <div className="logo-hex-dot"></div>
            </div>
          </div>
          <div className="sidebar-brand-title">
            <span className="brand-name">LectureAI</span>
            <span className="portal-badge">Student Panel</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="student-nav-menu">
          <button
            className={`student-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'classes' ? 'active' : ''}`}
            onClick={() => handleNavClick('classes')}
          >
            <BookOpen size={18} />
            <span>My Classes</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'lectures' ? 'active' : ''}`}
            onClick={() => handleNavClick('lectures')}
          >
            <Video size={18} />
            <span>My Lectures</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'notes' ? 'active' : ''}`}
            onClick={() => handleNavClick('notes')}
          >
            <FileText size={18} />
            <span>Notes</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'resources' ? 'active' : ''}`}
            onClick={() => handleNavClick('resources')}
          >
            <FolderOpen size={18} />
            <span>Resources</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'assignments' ? 'active' : ''}`}
            onClick={() => handleNavClick('assignments')}
          >
            <ClipboardList size={18} />
            <span>Assignments</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'quizzes' ? 'active' : ''}`}
            onClick={() => handleNavClick('quizzes')}
          >
            <HelpCircle size={18} />
            <span>Quizzes</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'calendar' ? 'active' : ''}`}
            onClick={() => handleNavClick('calendar')}
          >
            <Calendar size={18} />
            <span>Calendar</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'announcements' ? 'active' : ''}`}
            onClick={() => handleNavClick('announcements')}
          >
            <Megaphone size={18} />
            <span>Announcements</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'messages' ? 'active' : ''}`}
            onClick={() => handleNavClick('messages')}
          >
            <MessageSquare size={18} />
            <span>Messages</span>
            <span className="nav-count-badge">2</span>
          </button>

          <button
            className={`student-nav-item highlight-ai ${activeNav === 'ai-assistant' ? 'active' : ''}`}
            onClick={() => handleNavClick('ai-assistant')}
          >
            <Sparkles size={18} />
            <span>Ask AI</span>
            <span className="nav-ai-glow-tag">Smart</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'progress' ? 'active' : ''}`}
            onClick={() => handleNavClick('progress')}
          >
            <TrendingUp size={18} />
            <span>Progress</span>
          </button>

          <button
            className={`student-nav-item ${activeNav === 'bookmarks' ? 'active' : ''}`}
            onClick={() => handleNavClick('bookmarks')}
          >
            <Bookmark size={18} />
            <span>Bookmarks</span>
            {bookmarksCount > 0 && <span className="nav-count-badge">{bookmarksCount}</span>}
          </button>

          <button
            className="student-nav-item"
            onClick={onOpenSettings}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        {/* User Card & Logout */}
        <div className="student-sidebar-footer">
          <button className="student-nav-item logout-btn" onClick={onLogout} title="Sign out of your account">
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          <div className="student-user-card" onClick={onOpenSettings} style={{ cursor: 'pointer' }} title="View Profile & Settings">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'Arjun Sharma'}
              className="student-avatar-img"
            />
            <div className="student-user-meta">
              <span className="student-user-name">{user?.name || 'Arjun Sharma'}</span>
              <span className="student-user-sub">
                {user?.department || 'Computer Science'}, {user?.semester || '6th Semester'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="student-main-stage">
        {/* Header */}
        <header className="student-topbar">
          <div className="student-topbar-left">
            <h1 className="student-greeting">Good Morning, {user?.name || 'Student'}! 👋</h1>
            <p className="student-subgreeting">Stay focused and keep learning.</p>
          </div>

          <div className="student-topbar-right">
            {/* Search Bar */}
            <div className="student-search-pill">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search lectures, notes, resources..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleNavClick('lectures');
                  }
                }}
              />
            </div>

            {/* Notification bell */}
            <button
              className="topbar-icon-btn"
              title="Notifications"
              onClick={() => setShowNotifications(prev => !prev)}
            >
              <Bell size={20} />
              <span className="notif-badge">3</span>
            </button>

            {/* Chat button - opens AI Assistant */}
            <button
              className="topbar-icon-btn"
              title="Ask AI Assistant"
              onClick={() => handleNavClick('ai-assistant')}
            >
              <MessageSquare size={20} />
              <span className="notif-badge purple">AI</span>
            </button>

            {/* Avatar */}
            <div
              className="topbar-profile-circle"
              onClick={onOpenSettings}
              style={{ cursor: 'pointer' }}
              title="Settings & Profile"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                alt="Profile"
              />
            </div>
          </div>
        </header>

        {/* ================= 4 STATS CARDS ================= */}
        <section className="student-stats-row">
          <div className="student-stat-card" onClick={() => handleNavClick('classes')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box purple-stat">
              <BookOpen size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{classesCount}</div>
              <div className="stat-title">My Classes</div>
              <div className="stat-sub">{classesCount === 1 ? '1 Active Class' : `${classesCount} Active Classes`}</div>
            </div>
          </div>

          <div className="student-stat-card" onClick={() => handleNavClick('lectures')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box blue-stat">
              <Play size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{lecturesCount}</div>
              <div className="stat-title">My Lectures</div>
              <div className="stat-sub">{isDemo ? 'Completed / Total' : 'Recorded Lectures'}</div>
            </div>
          </div>

          <div className="student-stat-card" onClick={() => handleNavClick('assignments')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box green-stat">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{assignmentsCount}</div>
              <div className="stat-title">Assignments</div>
              <div className="stat-sub">{pendingCount} Pending</div>
            </div>
          </div>

          <div className="student-stat-card" onClick={() => handleNavClick('progress')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box orange-stat">
              <TrendingUp size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{progressPercent}</div>
              <div className="stat-title">Overall Progress</div>
              <div className="stat-sub">{progressSub}</div>
            </div>
          </div>
        </section>

        {/* ================= 3-COLUMN MIDDLE DASHBOARD ================= */}
        <section className="student-middle-grid">

          {/* Left Column: Today's Schedule */}
          <div className="student-card schedule-card">
            <div className="student-card-header">
              <div className="card-header-icon-title">
                <Calendar size={18} className="header-icon purple-text" />
                <h2>Today's Schedule</h2>
              </div>
              <button className="header-pill-btn" onClick={() => handleNavClick('calendar')}>
                View Calendar
              </button>
            </div>

            {todaySchedule.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94A3B8' }}>
                <Calendar size={36} style={{ margin: '0 auto 12px', opacity: 0.35, color: '#A855F7' }} />
                <h4 style={{ color: '#F1F5F9', fontSize: '15px', marginBottom: '6px' }}>No Classes Scheduled Today</h4>
                <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '280px', margin: '0 auto' }}>
                  You have no lectures or tutorials scheduled for today. Enjoy your day!
                </p>
              </div>
            ) : (
              <div className="student-schedule-list">
                {todaySchedule.map((cls) => {
                  const getTargetView = () => {
                    if (cls.name.toLowerCase().includes('data structure')) return 'subject:sub-dsa';
                    if (cls.name.toLowerCase().includes('database')) return 'subject:sub-dbms';
                    if (cls.name.toLowerCase().includes('operating')) return 'subject:sub-os';
                    return 'calendar';
                  };
                  return (
                    <div
                      key={cls.id}
                      className="schedule-item-row"
                      onClick={() => {
                        if (onNavigate) onNavigate(getTargetView());
                      }}
                      style={{ cursor: 'pointer' }}
                      title={`Click to open ${cls.name} classroom`}
                    >
                      <div className="schedule-time-box">
                        <span className="time-primary">{cls.time.split(' ')[0]}</span>
                        <span className="time-period">{cls.time.split(' ')[1]}</span>
                      </div>

                      <div className="schedule-info-box">
                        <h3 className="schedule-course-name">{cls.name}</h3>
                        <p className="schedule-section-sub">{cls.section}</p>
                        <div className="schedule-room">
                          <MapPin size={12} />
                          <span>{cls.room}</span>
                        </div>
                      </div>

                      <div className="schedule-tag-wrap">
                        <span className={`schedule-type-badge ${cls.typeClass}`}>{cls.type}</span>
                        <ChevronRight size={16} className="arrow-icon" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="student-card-footer">
              <button className="view-link-btn" onClick={() => handleNavClick('calendar')}>
                <span>View Full Schedule</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Middle Column: Recent Lectures */}
          <div className="student-card lectures-card">
            <div className="student-card-header">
              <div className="card-header-icon-title">
                <Play size={18} className="header-icon blue-text" />
                <h2>Recent Lectures</h2>
              </div>
              <button className="header-pill-btn" onClick={() => handleNavClick('lectures')}>
                View All
              </button>
            </div>

            {recentLectures.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94A3B8' }}>
                <Play size={36} style={{ margin: '0 auto 12px', opacity: 0.35, color: '#38BDF8' }} />
                <h4 style={{ color: '#F1F5F9', fontSize: '15px', marginBottom: '6px' }}>No Recorded Lectures Yet</h4>
                <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '280px', margin: '0 auto' }}>
                  Lectures recorded by your instructors will appear here with AI summaries and notes.
                </p>
              </div>
            ) : (
              <div className="recent-lectures-list">
                {recentLectures.map((lec) => (
                  <div
                    key={lec.id}
                    className="recent-lecture-row"
                    onClick={() => {
                      if (onNavigate) {
                        if (lec.id === 'lec-1') onNavigate('notes:cls-dbms-norm');
                        else if (lec.id === 'lec-2') onNavigate('notes:cls-dsa-trees');
                        else if (lec.id === 'lec-3') onNavigate('notes:cls-os-sync');
                        else if (lec.id === 'lec-4') onNavigate('notes:cls-dbms-er');
                        else onNavigate('notes');
                      }
                    }}
                    title="Click to view lecture notes and AI summary"
                  >
                    <div className="lecture-thumb-box">
                      <img src={lec.thumb} alt={lec.title} />
                      <span className="duration-tag">{lec.duration}</span>
                    </div>

                    <div className="lecture-details-box">
                      <h4 className="lecture-title">{lec.title}</h4>
                      <span className="lecture-course">{lec.course}</span>
                      <span className="lecture-date">{lec.date}</span>
                    </div>

                    <div className="lecture-action-icons">
                      <button
                        className="thumb-action-btn"
                        title="Download Notes"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigate) {
                            if (lec.id === 'lec-1') onNavigate('notes:cls-dbms-norm');
                            else if (lec.id === 'lec-2') onNavigate('notes:cls-dsa-trees');
                            else if (lec.id === 'lec-3') onNavigate('notes:cls-os-sync');
                            else if (lec.id === 'lec-4') onNavigate('notes:cls-dbms-er');
                            else onNavigate('notes');
                          }
                        }}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        className="thumb-action-btn"
                        title="View Class"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick('classes');
                        }}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="student-card-footer">
              <button className="view-link-btn" onClick={() => handleNavClick('lectures')}>
                <span>View All Lectures</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Deadlines & Announcements */}
          <div className="student-right-stack">
            {/* Upcoming Deadlines */}
            <div className="student-card deadlines-card">
              <div className="student-card-header">
                <div className="card-header-icon-title">
                  <Clock size={18} className="header-icon magenta-text" />
                  <h2>Upcoming Deadlines</h2>
                </div>
                <button className="header-pill-btn" onClick={() => handleNavClick('assignments')}>
                  View All
                </button>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 8px', opacity: 0.4, color: '#10B981' }} />
                  <h4 style={{ color: '#F1F5F9', fontSize: '14px', marginBottom: '4px' }}>All Caught Up! 🎉</h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>
                    You have no pending assignments or quiz deadlines.
                  </p>
                </div>
              ) : (
                <div className="deadlines-list">
                  {upcomingDeadlines.map((dl) => (
                    <div
                      key={dl.id}
                      className="deadline-row"
                      onClick={() => handleNavClick('assignments')}
                      style={{ cursor: 'pointer' }}
                      title="Click to view all assignments and deadlines"
                    >
                      <div className="deadline-left">
                        <h4 className="deadline-name">{dl.title}</h4>
                        <span className="deadline-course">{dl.course}</span>
                        <span className="deadline-date">Due: {dl.due}</span>
                      </div>
                      <div className={`deadline-badge ${dl.urgency}`}>
                        {dl.daysLeft}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Announcements */}
            <div className="student-card announcements-card">
              <div className="student-card-header">
                <div className="card-header-icon-title">
                  <Megaphone size={18} className="header-icon amber-text" />
                  <h2>Announcements</h2>
                </div>
                <button className="header-pill-btn" onClick={() => handleNavClick('announcements')}>
                  View All
                </button>
              </div>

              {announcements.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8' }}>
                  <Megaphone size={32} style={{ margin: '0 auto 8px', opacity: 0.4, color: '#F59E0B' }} />
                  <h4 style={{ color: '#F1F5F9', fontSize: '14px', marginBottom: '4px' }}>No Announcements</h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>Check back later for university updates.</p>
                </div>
              ) : (
                <div className="announcements-list">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="announcement-row"
                      onClick={() => handleNavClick('announcements')}
                      style={{ cursor: 'pointer' }}
                      title="Click to open announcements page"
                    >
                      <div className="ann-dot" style={{ backgroundColor: ann.color }}></div>
                      <div className="ann-body">
                        <h4 className="ann-title">{ann.title}</h4>
                        <p className="ann-desc">{ann.desc}</p>
                        <span className="ann-time">{ann.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </section>

        {/* ================= BOTTOM: QUICK ACCESS (9 CARDS) ================= */}
        <section className="student-quick-access-section">
          <div className="quick-access-header">
            <h2>Quick Access</h2>
          </div>

          <div className="quick-access-grid-9">
            <div className="quick-card" onClick={() => handleNavClick('classes')}>
              <div className="quick-icon-wrap purple-bg">
                <BookOpen size={22} />
              </div>
              <h3>My Classes</h3>
              <p>View your enrolled classes</p>
            </div>

            <div className="quick-card" onClick={() => handleNavClick('lectures')}>
              <div className="quick-icon-wrap blue-bg">
                <Play size={22} />
              </div>
              <h3>My Lectures</h3>
              <p>Watch recorded lectures</p>
            </div>

            <div className="quick-card" onClick={() => handleNavClick('notes')}>
              <div className="quick-icon-wrap emerald-bg">
                <FileText size={22} />
              </div>
              <h3>Notes</h3>
              <p>View & manage your notes</p>
            </div>

            <div className="quick-card" onClick={() => handleNavClick('resources')}>
              <div className="quick-icon-wrap amber-bg">
                <FolderOpen size={22} />
              </div>
              <h3>Resources</h3>
              <p>Study materials & references</p>
            </div>

            <div className="quick-card" onClick={() => handleNavClick('assignments')}>
              <div className="quick-icon-wrap rose-bg">
                <ClipboardList size={22} />
              </div>
              <h3>Assignments</h3>
              <p>View & submit assignments</p>
            </div>

            <div className="quick-card" onClick={() => handleNavClick('quizzes')}>
              <div className="quick-icon-wrap indigo-bg">
                <HelpCircle size={22} />
              </div>
              <h3>Quizzes</h3>
              <p>Attempt & review quizzes</p>
            </div>

            <div className="quick-card" onClick={() => handleNavClick('calendar')}>
              <div className="quick-icon-wrap teal-bg">
                <Calendar size={22} />
              </div>
              <h3>Calendar</h3>
              <p>Your class & exam schedule</p>
            </div>

            <div className="quick-card highlight-card" onClick={() => handleNavClick('ai-assistant')}>
              <div className="quick-icon-wrap cyan-bg">
                <Sparkles size={22} />
              </div>
              <h3>Ask AI</h3>
              <p>Ask questions & get help</p>
            </div>

            <div className="quick-card" onClick={() => handleNavClick('progress')}>
              <div className="quick-icon-wrap violet-bg">
                <TrendingUp size={22} />
              </div>
              <h3>Progress</h3>
              <p>Track your learning progress</p>
            </div>
          </div>
        </section>
      </main>

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        role="student"
      />
    </div>
  );
}
