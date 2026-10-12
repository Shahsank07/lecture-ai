import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Radio, FolderOpen,
  Megaphone, ClipboardCheck, HelpCircle, CheckSquare,
  Settings, LogOut, Bell, Calendar, Clock, MapPin,
  Users, ChevronRight, MoreVertical, Plus, Sparkles,
  Search, ArrowRight, BookMarked, UserCheck, BarChart3,
  Video, UploadCloud, FileText, CheckCircle2
} from 'lucide-react';
import UploadNotesModal from './UploadNotesModal';
import UploadQuizModal from './UploadQuizModal';
import MarkAttendanceModal from './MarkAttendanceModal';
import NotificationsModal from '../NotificationsModal';
import './FacultyPanel.css';

export default function FacultyPanel({
  user,
  subjects = [],
  onLogout,
  onStartLecture,
  onNavigate,
  onOpenSettings
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUploadNotes, setShowUploadNotes] = useState(false);
  const [showUploadQuiz, setShowUploadQuiz] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedClassForAtt, setSelectedClassForAtt] = useState('Data Structures');

  const isDemo =
    user?.id === 'faculty-alex-johnson' ||
    user?.email?.toLowerCase().includes('alex.johnson@university.edu');

  // Interactive Announcements State
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementsList, setAnnouncementsList] = useState(isDemo ? [
    {
      id: 'ann-1',
      title: 'Mid Sem Exams Schedule Announcement',
      text: 'Mid semester examinations for B.Tech CSE (3rd and 4th Sem) will commence from next Monday. Please review the syllabus outline.',
      classGroup: 'All Classes',
      time: '2 hours ago'
    },
    {
      id: 'ann-2',
      title: 'DSA Assignment 2 Problem Set Posted',
      text: 'The problem set on AVL Tree Rotations and B-Trees is now live on the student portal. Due date is May 25.',
      classGroup: 'Data Structures (3rd Sem)',
      time: '1 day ago'
    }
  ] : []);

  const todayClasses = isDemo ? [
    {
      id: 'ds-101',
      time: '10:00 AM',
      name: 'Data Structures',
      section: 'B.Tech CSE - 3rd Semester',
      room: 'Room 204',
      students: 42
    },
    {
      id: 'dbms-102',
      time: '12:00 PM',
      name: 'Database Management Systems',
      section: 'B.Tech CSE - 4th Semester',
      room: 'Room 301',
      students: 38
    },
    {
      id: 'os-103',
      time: '02:00 PM',
      name: 'Operating Systems',
      section: 'B.Tech CSE - 3rd Semester',
      room: 'Room 204',
      students: 40
    }
  ] : [];

  const upcomingLectures = isDemo ? [
    {
      id: 'cn-201',
      month: 'MAY',
      day: '21',
      name: 'Computer Networks',
      section: 'B.Tech CSE - 4th Semester',
      time: '11:00 AM - 12:00 PM',
      room: 'Room 302'
    },
    {
      id: 'se-202',
      month: 'MAY',
      day: '22',
      name: 'Software Engineering',
      section: 'B.Tech CSE - 5th Semester',
      time: '01:00 PM - 02:00 PM',
      room: 'Room 301'
    },
    {
      id: 'ai-203',
      month: 'MAY',
      day: '23',
      name: 'Artificial Intelligence',
      section: 'B.Tech CSE - 6th Semester',
      time: '10:00 AM - 11:00 AM',
      room: 'Room 402'
    }
  ] : [];

  const classesCount = isDemo ? 5 : (subjects?.length || user?.classesCount || 0);
  const lecturesCount = isDemo ? 3 : 0;
  const studentsCount = isDemo ? 142 : (user?.studentsCount || 0);
  const pendingTasksCount = isDemo ? 7 : 0;

  const handleStartClassLecture = (cls) => {
    if (onStartLecture) {
      onStartLecture({
        id: cls.id,
        name: cls.name,
        section: cls.section,
        room: cls.room
      });
    }
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementTitle.trim()) return;
    const newAnn = {
      id: 'ann-' + Date.now(),
      title: announcementTitle.trim(),
      text: announcementText.trim() || 'Please check the course portal for full details.',
      classGroup: 'Data Structures & DBMS',
      time: 'Just now'
    };
    setAnnouncementsList(prev => [newAnn, ...prev]);
    setAnnouncementTitle('');
    setAnnouncementText('');
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'live-lecture':
        handleStartClassLecture(todayClasses[0]);
        break;
      case 'upload-notes':
      case 'resources':
        setShowUploadNotes(true);
        break;
      case 'upload-quiz':
      case 'quizzes':
        setShowUploadQuiz(true);
        break;
      case 'attendance':
        setSelectedClassForAtt('Data Structures');
        setShowAttendance(true);
        break;
      case 'classes':
      case 'lecture-mgmt':
        setActiveTab('classes');
        break;
      case 'assignments':
        setActiveTab('assignments');
        break;
      case 'announcements':
        setActiveTab('announcements');
        break;
      default:
        break;
    }
  };

  return (
    <div className="faculty-portal-layout">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="faculty-sidebar">
        {/* Brand */}
        <div className="faculty-sidebar-brand">
          <div className="sidebar-logo-hex">
            <div className="logo-hex-inner">
              <div className="logo-hex-dot"></div>
            </div>
          </div>
          <div className="sidebar-brand-title">
            <span className="brand-name">LectureAI</span>
            <span className="portal-badge">Faculty Panel</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="faculty-nav-menu">
          <button
            className={`faculty-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`faculty-nav-item ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            <BookOpen size={18} />
            <span>My Classes</span>
          </button>

          <button
            className={`faculty-nav-item ${activeTab === 'lecture-mgmt' ? 'active' : ''}`}
            onClick={() => setActiveTab('lecture-mgmt')}
          >
            <Calendar size={18} />
            <span>Lecture Management</span>
          </button>

          <button
            className="faculty-nav-item highlight-live"
            onClick={() => handleStartClassLecture(todayClasses[0])}
            title="Record Live Class & Generate AI Summary"
          >
            <Radio size={18} className="live-pulse-dot" />
            <span>Live Lecture</span>
            <span className="nav-ai-tag">AI</span>
          </button>

          <button
            className="faculty-nav-item"
            onClick={() => setShowUploadNotes(true)}
          >
            <FolderOpen size={18} />
            <span>Resources</span>
          </button>

          <button
            className={`faculty-nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <Megaphone size={18} />
            <span>Announcements</span>
          </button>

          <button
            className={`faculty-nav-item ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            <ClipboardCheck size={18} />
            <span>Assignments</span>
          </button>

          <button
            className="faculty-nav-item"
            onClick={() => setShowUploadQuiz(true)}
          >
            <HelpCircle size={18} />
            <span>Quizzes</span>
          </button>

          <button
            className="faculty-nav-item"
            onClick={() => setShowAttendance(true)}
          >
            <CheckSquare size={18} />
            <span>Attendance</span>
          </button>
        </nav>

        {/* Sidebar Footer: Settings & Profile */}
        <div className="faculty-sidebar-footer">
          <button className="faculty-nav-item" onClick={onOpenSettings}>
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div className="faculty-user-card">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'Dr. Alex Johnson'}
              className="faculty-avatar-img"
            />
            <div className="faculty-user-meta">
              <span className="faculty-user-name">{user?.name || 'Dr. Alex Johnson'}</span>
              <span className="faculty-user-dept">{user?.department || 'Computer Science'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="faculty-main-stage">
        {/* Top Header */}
        <header className="faculty-topbar">
          <div className="topbar-left">
            <h1 className="faculty-greeting">Good Morning, {user?.name || 'Dr. Alex'}! 👋</h1>
            <p className="faculty-subgreeting">Here's what's happening in your classes today.</p>
          </div>

          <div className="topbar-right">
            {/* Notifications */}
            <button
              className="topbar-icon-btn"
              title="Notifications"
              onClick={() => setShowNotifications(prev => !prev)}
            >
              <Bell size={20} />
              <span className="notif-badge">3</span>
            </button>

            {/* Date Display */}
            <div className="topbar-date-pill">
              <Calendar size={18} />
              <span>20 May 2025 Tuesday</span>
            </div>

            {/* Profile Avatar */}
            <div className="topbar-profile-circle">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Profile"
              />
            </div>
          </div>
        </header>

        {/* 4 STATS CARDS */}
        <section className="faculty-stats-row">
          <div className="faculty-stat-card" onClick={() => setActiveTab('classes')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box purple-stat">
              <Users size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{classesCount}</div>
              <div className="stat-title">My Classes</div>
              <div className="stat-sub">{classesCount === 1 ? '1 Active Class' : `${classesCount} Active Classes`}</div>
            </div>
          </div>

          <div className="faculty-stat-card" onClick={() => setActiveTab('lecture-mgmt')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box blue-stat">
              <BookOpen size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{lecturesCount}</div>
              <div className="stat-title">Today's Lectures</div>
              <div className="stat-sub">Scheduled Today</div>
            </div>
          </div>

          <div className="faculty-stat-card" onClick={() => setShowAttendance(true)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box green-stat">
              <Users size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{studentsCount}</div>
              <div className="stat-title">Total Students</div>
              <div className="stat-sub">Across All Classes</div>
            </div>
          </div>

          <div className="faculty-stat-card" onClick={() => setShowUploadQuiz(true)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-box orange-stat">
              <ClipboardCheck size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{pendingTasksCount}</div>
              <div className="stat-title">Pending Tasks</div>
              <div className="stat-sub">Assignments / Quizzes</div>
            </div>
          </div>
        </section>

        {/* ================= TAB: DASHBOARD (Matching Image 3) ================= */}
        {activeTab === 'dashboard' && (
          <>
            <section className="faculty-middle-grid">
              {/* Today's Classes Card */}
              <div className="faculty-content-card">
                <div className="content-card-header">
                  <div className="card-header-icon-title">
                    <Calendar size={18} className="header-icon purple-text" />
                    <h2>Today's Classes</h2>
                  </div>
                </div>

                {todayClasses.length === 0 ? (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: '#94A3B8' }}>
                    <Calendar size={36} style={{ margin: '0 auto 12px', opacity: 0.35, color: '#A855F7' }} />
                    <h4 style={{ color: '#F1F5F9', fontSize: '15px', marginBottom: '6px' }}>No Classes Scheduled Today</h4>
                    <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '300px', margin: '0 auto' }}>
                      You have no classes scheduled for today. Start a live lecture anytime to record and generate AI summaries.
                    </p>
                  </div>
                ) : (
                  <div className="classes-timeline-list">
                    {todayClasses.map((cls) => (
                      <div key={cls.id} className="timeline-class-row">
                        <div className="timeline-time-box">
                          <span className="time-primary">{cls.time.split(' ')[0]}</span>
                          <span className="time-period">{cls.time.split(' ')[1]}</span>
                        </div>

                        <div className="timeline-info-box">
                          <h3 className="class-course-name">{cls.name}</h3>
                          <p className="class-section-sub">{cls.section}</p>
                          <div className="class-room-badge">
                            <MapPin size={13} />
                            <span>{cls.room}</span>
                          </div>
                        </div>

                        <div className="timeline-students-badge">
                          <span className="students-num">{cls.students}</span>
                          <span className="students-label">Students</span>
                        </div>

                        <button
                          className="start-lecture-action-btn"
                          onClick={() => handleStartClassLecture(cls)}
                          title="Start recording class and let AI generate summary notes"
                        >
                          <span>Start Lecture</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="content-card-footer">
                  <button className="view-link-btn" onClick={() => setActiveTab('classes')}>
                    <span>View Full Schedule</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Upcoming Lectures Card */}
              <div className="faculty-content-card">
                <div className="content-card-header">
                  <div className="card-header-icon-title">
                    <Clock size={18} className="header-icon blue-text" />
                    <h2>Upcoming Lectures</h2>
                  </div>
                  <button className="header-pill-btn" onClick={() => setActiveTab('lecture-mgmt')}>
                    View Calendar
                  </button>
                </div>

                {upcomingLectures.length === 0 ? (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: '#94A3B8' }}>
                    <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.35, color: '#38BDF8' }} />
                    <h4 style={{ color: '#F1F5F9', fontSize: '15px', marginBottom: '6px' }}>No Upcoming Lectures</h4>
                    <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '300px', margin: '0 auto' }}>
                      Future scheduled lectures and exam sessions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="upcoming-lectures-list">
                    {upcomingLectures.map((item) => (
                      <div key={item.id} className="upcoming-lecture-row">
                        <div className="upcoming-date-badge">
                          <span className="month-tag">{item.month}</span>
                          <span className="day-number">{item.day}</span>
                        </div>

                        <div className="upcoming-details">
                          <h3 className="upcoming-title">{item.name}</h3>
                          <p className="upcoming-section">{item.section}</p>
                          <div className="upcoming-time-loc">
                            <Clock size={13} />
                            <span>{item.time}</span>
                            <span className="dot-sep">•</span>
                            <MapPin size={13} />
                            <span>{item.room}</span>
                          </div>
                        </div>

                        <button className="row-options-btn" onClick={() => handleStartClassLecture({ id: item.id, name: item.name, section: item.section, room: item.room })}>
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions (8 Cards) */}
            <section className="faculty-quick-actions-section">
              <div className="quick-actions-header">
                <h2>Quick Actions</h2>
              </div>

              <div className="quick-actions-grid-8">
                <div className="quick-action-card" onClick={() => handleQuickAction('classes')}>
                  <div className="action-icon-wrapper purple-bg">
                    <BookOpen size={24} />
                  </div>
                  <h3>My Classes</h3>
                  <p>Create & manage your classes</p>
                </div>

                <div className="quick-action-card" onClick={() => handleQuickAction('lecture-mgmt')}>
                  <div className="action-icon-wrapper blue-bg">
                    <Calendar size={24} />
                  </div>
                  <h3>Lecture Management</h3>
                  <p>Create, schedule & manage lectures</p>
                </div>

                <div className="quick-action-card" onClick={() => handleQuickAction('live-lecture')}>
                  <div className="action-icon-wrapper teal-bg">
                    <Radio size={24} />
                  </div>
                  <h3>Live Lecture</h3>
                  <p>Start live lecture session & AI notes</p>
                </div>

                <div className="quick-action-card highlight-card" onClick={() => handleQuickAction('upload-notes')}>
                  <div className="action-icon-wrapper amber-bg">
                    <FolderOpen size={24} />
                  </div>
                  <h3>Resources</h3>
                  <p>Upload & share learning resources</p>
                </div>

                <div className="quick-action-card" onClick={() => handleQuickAction('announcements')}>
                  <div className="action-icon-wrapper rose-bg">
                    <Megaphone size={24} />
                  </div>
                  <h3>Announcements</h3>
                  <p>Send announcements to your classes</p>
                </div>

                <div className="quick-action-card" onClick={() => handleQuickAction('assignments')}>
                  <div className="action-icon-wrapper green-bg">
                    <ClipboardCheck size={24} />
                  </div>
                  <h3>Assignments</h3>
                  <p>Create assignments for students</p>
                </div>

                <div className="quick-action-card highlight-card" onClick={() => handleQuickAction('upload-quiz')}>
                  <div className="action-icon-wrapper indigo-bg">
                    <HelpCircle size={24} />
                  </div>
                  <h3>Quizzes</h3>
                  <p>Create & manage quizzes</p>
                </div>

                <div className="quick-action-card highlight-card" onClick={() => handleQuickAction('attendance')}>
                  <div className="action-icon-wrapper orange-bg">
                    <Users size={24} />
                  </div>
                  <h3>Attendance</h3>
                  <p>Record & view attendance</p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ================= TAB: MY CLASSES & LECTURE MANAGEMENT ================= */}
        {(activeTab === 'classes' || activeTab === 'lecture-mgmt') && (
          <div className="faculty-classes-view">
            <div className="subview-header">
              <div>
                <h2>Course & Lecture Management</h2>
                <p>Manage syllabus, live sessions, attendance, and study materials</p>
              </div>
              <button className="subview-back-to-dash" onClick={() => setActiveTab('dashboard')}>
                ← Back to Dashboard
              </button>
            </div>

            <div className="classes-cards-grid">
              {[...todayClasses, ...upcomingLectures.map(u => ({ id: u.id, name: u.name, section: u.section, room: u.room, students: 36, time: u.time }))].map(cls => (
                <div key={cls.id} className="faculty-class-card">
                  <div className="f-class-header">
                    <h3>{cls.name}</h3>
                    <span className="f-class-badge">{cls.section}</span>
                  </div>
                  <div className="f-class-meta">
                    <div><Clock size={14} /> <span>{cls.time || '10:00 AM'}</span></div>
                    <div><MapPin size={14} /> <span>{cls.room}</span></div>
                    <div><Users size={14} /> <span>{cls.students || 40} Students</span></div>
                  </div>
                  <div className="f-class-actions">
                    <button
                      className="f-btn start-btn"
                      onClick={() => handleStartClassLecture(cls)}
                    >
                      <Radio size={14} />
                      <span>Start Lecture & AI Notes</span>
                    </button>
                    <button
                      className="f-btn notes-btn"
                      onClick={() => setShowUploadNotes(true)}
                    >
                      <UploadCloud size={14} />
                      <span>Upload Notes</span>
                    </button>
                    <button
                      className="f-btn att-btn"
                      onClick={() => {
                        setSelectedClassForAtt(cls.name);
                        setShowAttendance(true);
                      }}
                    >
                      <CheckSquare size={14} />
                      <span>Attendance</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: ANNOUNCEMENTS ================= */}
        {activeTab === 'announcements' && (
          <div className="faculty-classes-view">
            <div className="subview-header">
              <div>
                <h2>Announcements Board</h2>
                <p>Broadcast updates, syllabus alerts, and notifications to all enrolled students</p>
              </div>
              <button className="subview-back-to-dash" onClick={() => setActiveTab('dashboard')}>
                ← Back to Dashboard
              </button>
            </div>

            <div className="announcements-management-grid">
              {/* Creator Card */}
              <div className="faculty-content-card">
                <h3>Draft New Announcement</h3>
                <form onSubmit={handlePostAnnouncement} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Announcement Title..."
                    value={announcementTitle}
                    onChange={e => setAnnouncementTitle(e.target.value)}
                    required
                    className="modal-input"
                  />
                  <textarea
                    rows="4"
                    placeholder="Write announcement body..."
                    value={announcementText}
                    onChange={e => setAnnouncementText(e.target.value)}
                    required
                    className="modal-textarea"
                  />
                  <button type="submit" className="modal-primary-btn purple-btn" style={{ alignSelf: 'flex-start' }}>
                    <Megaphone size={16} />
                    <span>Publish Announcement</span>
                  </button>
                </form>
              </div>

              {/* Feed Card */}
              <div className="faculty-content-card">
                <h3>Recent Announcements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  {announcementsList.map(ann => (
                    <div key={ann.id} style={{ background: '#13192B', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ color: '#FFFFFF', fontSize: '14px' }}>{ann.title}</strong>
                        <span style={{ fontSize: '11px', color: '#818CF8' }}>{ann.time}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 8px 0', lineHeight: '1.4' }}>{ann.text}</p>
                      <span style={{ fontSize: '10px', background: 'rgba(99,102,241,0.15)', color: '#A5B4FC', padding: '2px 8px', borderRadius: '4px' }}>
                        {ann.classGroup}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: ASSIGNMENTS ================= */}
        {activeTab === 'assignments' && (
          <div className="faculty-classes-view">
            <div className="subview-header">
              <div>
                <h2>Assignments Manager</h2>
                <p>Create assignments, set deadlines, and grade student submissions</p>
              </div>
              <button className="subview-back-to-dash" onClick={() => setActiveTab('dashboard')}>
                ← Back to Dashboard
              </button>
            </div>

            <div className="classes-cards-grid">
              <div className="faculty-class-card">
                <div className="f-class-header">
                  <h3>DSA Assignment 2: AVL Tree Rotations</h3>
                  <span className="f-class-badge">Data Structures</span>
                </div>
                <div className="f-class-meta">
                  <div><Calendar size={14} /> <span>Due: May 25, 2025</span></div>
                  <div><Users size={14} /> <span>38 / 42 Submitted</span></div>
                </div>
                <div className="f-class-actions">
                  <button className="f-btn notes-btn" onClick={() => alert('Viewing student submissions...')}>
                    <span>View 38 Submissions</span>
                  </button>
                  <button className="f-btn att-btn" onClick={() => setShowUploadNotes(true)}>
                    <span>Upload Solution Notes</span>
                  </button>
                </div>
              </div>

              <div className="faculty-class-card">
                <div className="f-class-header">
                  <h3>DBMS Practical: SQL Schema Normalization</h3>
                  <span className="f-class-badge">Database Management</span>
                </div>
                <div className="f-class-meta">
                  <div><Calendar size={14} /> <span>Due: May 28, 2025</span></div>
                  <div><Users size={14} /> <span>34 / 38 Submitted</span></div>
                </div>
                <div className="f-class-actions">
                  <button className="f-btn notes-btn" onClick={() => alert('Viewing student submissions...')}>
                    <span>View 34 Submissions</span>
                  </button>
                  <button className="f-btn att-btn" onClick={() => setShowUploadNotes(true)}>
                    <span>Upload Schema Notes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODALS ================= */}
      <UploadNotesModal
        isOpen={showUploadNotes}
        onClose={() => setShowUploadNotes(false)}
        onUploaded={(note) => {
          console.log('Uploaded note:', note);
        }}
      />

      <UploadQuizModal
        isOpen={showUploadQuiz}
        onClose={() => setShowUploadQuiz(false)}
        onQuizCreated={(quiz) => {
          console.log('Created quiz:', quiz);
        }}
      />

      <MarkAttendanceModal
        isOpen={showAttendance}
        defaultClass={selectedClassForAtt}
        onClose={() => setShowAttendance(false)}
      />

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        role="faculty"
      />
    </div>
  );
}
