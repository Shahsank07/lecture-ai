import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Video, FileText, FolderOpen,
  ClipboardList, HelpCircle, Calendar, Megaphone, MessageSquare,
  Sparkles, TrendingUp, Bookmark, Settings, LogOut, Search,
  Bell, Play, Download, MoreVertical, Clock, MapPin,
  ChevronRight, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import './StudentPanel.css';

export default function StudentPanel({
  user,
  onLogout,
  onNavigate,
  onOpenSettings
}) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const todaySchedule = [
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
  ];

  const recentLectures = [
    {
      id: 'lec-1',
      title: 'Database Normalization (1NF to 3NF)',
      course: 'Database Management Systems',
      date: '19 May 2025',
      duration: '45:20',
      thumb: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'lec-2',
      title: 'Stacks and Queues',
      course: 'Data Structures',
      date: '18 May 2025',
      duration: '38:15',
      thumb: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'lec-3',
      title: 'Process Synchronization',
      course: 'Operating Systems',
      date: '17 May 2025',
      duration: '52:10',
      thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'lec-4',
      title: 'ER Model and Relationships',
      course: 'Database Management Systems',
      date: '16 May 2025',
      duration: '41:05',
      thumb: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80'
    }
  ];

  const upcomingDeadlines = [
    {
      id: 'dl-1',
      title: 'DSA Assignment 2',
      course: 'Data Structures',
      due: '22 May 2025',
      daysLeft: '2 Days Left',
      urgency: 'danger'
    },
    {
      id: 'dl-2',
      title: 'DBMS Quiz 1',
      course: 'Database Management Systems',
      due: '25 May 2025',
      daysLeft: '5 Days Left',
      urgency: 'warning'
    },
    {
      id: 'dl-3',
      title: 'OS Case Study',
      course: 'Operating Systems',
      due: '28 May 2025',
      daysLeft: '8 Days Left',
      urgency: 'safe'
    }
  ];

  const announcements = [
    {
      id: 'ann-1',
      title: 'Mid Sem Exams Schedule',
      desc: 'Mid semester examinations will start from next Monday. Check room allocations...',
      time: '2 hours ago',
      color: '#EF4444'
    },
    {
      id: 'ann-2',
      title: 'Data Structures Assignment',
      desc: 'New assignment has been posted. Please review the problem statements...',
      time: '1 day ago',
      color: '#F59E0B'
    },
    {
      id: 'ann-3',
      title: 'Guest Lecture on AI',
      desc: 'Join the session on Artificial Intelligence and Large Language Models...',
      time: '2 days ago',
      color: '#10B981'
    }
  ];

  const handleNavClick = (viewId) => {
    setActiveNav(viewId);
    if (onNavigate) {
      if (viewId === 'notes') onNavigate('notes');
      else if (viewId === 'resources') onNavigate('resources');
      else if (viewId === 'ai-assistant') onNavigate('ai-assistant');
      else if (viewId === 'progress') onNavigate('progress');
      else if (viewId === 'calendar') onNavigate('calendar');
      else if (viewId === 'quizzes') onNavigate('quizzes');
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
          <div className="student-user-card">
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

          <button className="student-logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="student-main-stage">
        {/* Header */}
        <header className="student-topbar">
          <div className="student-topbar-left">
            <h1 className="student-greeting">Good Morning, {user?.name ? user.name.split(' ')[0] : 'Arjun'}! 👋</h1>
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
              />
            </div>

            {/* Notification bell */}
            <button className="topbar-icon-btn" title="3 Notifications">
              <Bell size={20} />
              <span className="notif-badge">3</span>
            </button>

            {/* Chat button */}
            <button className="topbar-icon-btn" title="2 Messages">
              <MessageSquare size={20} />
              <span className="notif-badge purple">2</span>
            </button>

            {/* Avatar */}
            <div className="topbar-profile-circle">
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
              <div className="stat-value">5</div>
              <div className="stat-title">My Classes</div>
              <div className="stat-sub">Active Classes</div>
            </div>
          </div>

          <div className="student-stat-card" onClick={() => handleNavClick('lectures')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box blue-stat">
              <Play size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">12</div>
              <div className="stat-title">My Lectures</div>
              <div className="stat-sub">Completed / Total</div>
            </div>
          </div>

          <div className="student-stat-card" onClick={() => handleNavClick('assignments')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box green-stat">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">8</div>
              <div className="stat-title">Assignments</div>
              <div className="stat-sub">2 Pending</div>
            </div>
          </div>

          <div className="student-stat-card" onClick={() => handleNavClick('progress')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box orange-stat">
              <TrendingUp size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">75%</div>
              <div className="stat-title">Overall Progress</div>
              <div className="stat-sub">Keep it up!</div>
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

            <div className="student-schedule-list">
              {todaySchedule.map((cls) => (
                <div key={cls.id} className="schedule-item-row">
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
              ))}
            </div>

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
                    <button className="thumb-action-btn" title="Download Notes">
                      <Download size={14} />
                    </button>
                    <button className="thumb-action-btn" title="Options">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

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

              <div className="deadlines-list">
                {upcomingDeadlines.map((dl) => (
                  <div key={dl.id} className="deadline-row">
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

              <div className="announcements-list">
                {announcements.map((ann) => (
                  <div key={ann.id} className="announcement-row">
                    <div className="ann-dot" style={{ backgroundColor: ann.color }}></div>
                    <div className="ann-body">
                      <h4 className="ann-title">{ann.title}</h4>
                      <p className="ann-desc">{ann.desc}</p>
                      <span className="ann-time">{ann.time}</span>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
