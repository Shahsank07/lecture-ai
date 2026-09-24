import { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, ChevronDown, LayoutDashboard, BookOpen, Radio, FileText, 
  Sparkles, HelpCircle, Calendar, Folder, MessageSquare, TrendingUp, 
  Settings, LogOut, Search, ChevronLeft 
} from 'lucide-react';
import SettingsModal from '../Settings/SettingsModal';
import './Navbar.css';

function Navbar({
  user,
  subjects = [],
  currentView = 'dashboard',
  searchQuery = '',
  onSearchChange,
  selectedFilter = 'This Week',
  onFilterChange,
  onNavigate,
  onLogout,
  onOpenSettings,
  onOpenCreate,
  onStartRecording
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Lecture Saved', desc: 'Data Structures – Trees session was saved to IndexedDB', time: '10m ago', read: false },
    { id: '2', title: 'AI Quiz Ready', desc: 'New quiz generated for Database Normalization', time: '1h ago', read: false },
    { id: '3', title: 'Study Streak Milestone', desc: 'You reached a 7-day study streak! 🎉', time: '1d ago', read: true }
  ]);

  const sidebarRef = useRef(null);
  const notificationRef = useRef(null);
  const filterRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isSidebarOpen && !isMobile) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isSidebarOpen, isMobile]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (isMobile && isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const isHamburger = event.target.closest('.hamburger-btn');
        if (!isHamburger) {
          setIsSidebarOpen(false);
        }
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavClick = (view) => {
    if (view === 'live-lecture') {
      if (onStartRecording) {
        onStartRecording();
      } else {
        onNavigate('dashboard');
      }
    } else {
      onNavigate(view);
    }
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'lectures', label: 'My Lectures', icon: <BookOpen size={18} /> },
    { id: 'live-lecture', label: 'Live Lecture', icon: <Radio size={18} /> },
    { id: 'notes', label: 'Notes', icon: <FileText size={18} /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Sparkles size={18} /> },
    { id: 'quizzes', label: 'Quizzes', icon: <HelpCircle size={18} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
    { id: 'resources', label: 'Resources', icon: <Folder size={18} /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <MessageSquare size={18} /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={18} /> },
  ];

  return (
    <>
      {/* Top Bar matching Reference */}
      <header className="lecture-topbar">
        <div className="topbar-left">
          <button 
            className="hamburger-btn" 
            onClick={toggleSidebar}
            aria-label="Toggle Navigation"
          >
            <Menu size={20} />
          </button>
          
          <div className="brand" onClick={() => onNavigate('dashboard')}>
            <div className="logo-badge">
              <span className="logo-icon">🔮</span>
            </div>
            <span className="brand-name">LectureAI</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="topbar-search">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search lectures, topics, notes..." 
            value={searchQuery}
            onChange={(e) => onSearchChange ? onSearchChange(e.target.value) : null}
          />
        </div>

        {/* Right Actions */}
        <div className="topbar-actions">
          {/* Notification Bell Dropdown */}
          <div className="notification-wrapper" ref={notificationRef} style={{ position: 'relative' }}>
            <button 
              className="topbar-icon-btn" 
              title="Notifications"
              onClick={() => setShowNotifications(prev => !prev)}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>

            {showNotifications && (
              <div className="notification-dropdown" style={{
                position: 'absolute',
                top: '46px',
                right: '0',
                width: '320px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 1400,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Notifications</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#8f66ff', fontSize: '11px', cursor: 'pointer' }}>Mark Read</button>
                    <button onClick={clearAllNotifications} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '11px', cursor: 'pointer' }}>Clear</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center', margin: '16px 0' }}>No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: n.read ? 'transparent' : 'var(--bg-tertiary)',
                        borderLeft: n.read ? 'none' : '3px solid #635bff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{n.title}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{n.desc}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="filter-dropdown-wrapper" ref={filterRef} style={{ position: 'relative' }}>
            <div className="filter-dropdown-btn" onClick={() => setShowFilterDropdown(prev => !prev)}>
              <span>{selectedFilter || 'This Week'}</span>
              <ChevronDown size={14} />
            </div>

            {showFilterDropdown && (
              <div className="filter-dropdown-menu" style={{
                position: 'absolute',
                top: '46px',
                right: '0',
                width: '140px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1400,
                padding: '4px 0',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {['All Time', 'This Week', 'This Month'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => {
                      if (onFilterChange) onFilterChange(opt);
                      setShowFilterDropdown(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      background: 'none',
                      border: 'none',
                      color: (selectedFilter || 'This Week') === opt ? '#8f66ff' : 'var(--text-primary)',
                      fontSize: 'var(--text-xs)',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Drawer matching Reference */}
      <aside 
        className={`sidebar-drawer ${isSidebarOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : 'desktop'}`}
        ref={sidebarRef}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => onNavigate('dashboard')}>
            <div className="logo-badge">🔮</div>
            <span className="sidebar-title">LectureAI</span>
          </div>
          <button className="sidebar-collapse-btn" onClick={toggleSidebar}>
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'lectures' && currentView.startsWith('subject:'));
            return (
              <button 
                key={item.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <button 
            className={`sidebar-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              else setShowSettings(true);
              if (isMobile) setIsSidebarOpen(false);
            }}
          >
            <span className="sidebar-icon"><Settings size={18} /></span>
            <span>Settings</span>
          </button>
        </nav>

        {/* User Profile Footer Pill */}
        <div className="sidebar-footer">
          <div className="user-profile-pill" onClick={handleLogout} title="Click to Logout">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Shashank'}</span>
              <span className="user-role">Student</span>
            </div>
            <LogOut size={16} className="user-dropdown-icon" />
          </div>
        </div>
      </aside>

      {/* Settings Modal fallback */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}

export default Navbar;
