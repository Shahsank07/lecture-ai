import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard';
import SubjectView from './components/SubjectView';
import LiveSession from './components/LiveSession';
import NoteViewer from './components/NoteViewer';
import NoteEditor from './components/NoteEditor';
import AuthPage from './components/Auth/AuthPage';
import FacultyPanel from './components/Faculty/FacultyPanel';
import StudentPanel from './components/Student/StudentPanel';
import CreateSubjectModal from './components/CreateSubjectModal';
import SettingsModal from './components/Settings/SettingsModal';
import Calendar from './components/Calendar';
import ResourcesPage from './components/ResourcesPage';
import AIAssistantPage from './components/AIAssistantPage';
import ProgressPage from './components/ProgressPage';
import FlashcardViewerPage from './components/FlashcardViewerPage';
import AssignmentsPage from './components/AssignmentsPage';
import AnnouncementsPage from './components/AnnouncementsPage';
import {
  getAllSubjects, getSubject, getClass, saveSubject, saveClass,
  getAllClasses, seedDefaultSubjectsAndClasses
} from './db';
import { getCurrentUser, logout } from './auth';
import { generateId } from './utils/helpers';
import { ArrowLeft } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [view, setView] = useState('dashboard');
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('This Week');

  // Modals controlled globally
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const loadSubjects = useCallback(async () => {
    if (!user) return;
    try {
      const isDemo = user.id === 'faculty-alex-johnson' || user.id === 'student-arjun-sharma' || user.email?.toLowerCase().includes('@university.edu');
      if (isDemo) {
        await seedDefaultSubjectsAndClasses(user.id);
      }
      const subs = await getAllSubjects(user.id);
      setSubjects(subs);
    } catch (e) {
      console.warn('Error loading subjects:', e);
    }
  }, [user]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const navigate = useCallback(async (newView) => {
    // Immediately set view for 0ms instant UI response
    setView(newView);

    if (newView === 'live-lecture') {
      await handleQuickStartRecording();
      return;
    }

    if (newView === 'dashboard') {
      setCurrentSubject(null);
      setCurrentClass(null);
      loadSubjects().catch(() => {});
      return;
    }

    if (newView.startsWith('subject:')) {
      const id = newView.split(':')[1];
      let sub = subjects.find(s => s.id === id);
      if (sub) {
        setCurrentSubject(sub);
      } else {
        getSubject(id).then(loaded => {
          if (loaded) setCurrentSubject(loaded);
        }).catch(() => {});
      }
    } else if (newView.startsWith('session:') || newView.startsWith('notes:') || newView.startsWith('edit:')) {
      const id = newView.split(':')[1];
      let cls = await getClass(id);
      if (!cls && user) {
        await seedDefaultSubjectsAndClasses(user.id);
        cls = await getClass(id);
      }
      if (!cls) {
        const allClasses = await getAllClasses();
        cls = allClasses.find(c => c.id === id || c.id?.startsWith(id) || id?.startsWith(c.id)) || allClasses[0];
      }
      if (!cls) {
        cls = {
          id,
          subjectId: subjects[0]?.id || 'sub-dsa',
          title: 'Lecture Session',
          date: new Date().toISOString(),
          duration: 2400,
          status: 'completed',
          transcript: 'Lecture recording and transcript notes.',
          notes: [{ id: 'n1', timestamp: 60, text: 'Core lecture principles and discussion points.', highlights: [] }],
          summary: {
            overview: 'Comprehensive review of lecture principles, architectural models, and examples.',
            keyTakeaways: ['Foundational concept established.', 'Practical implementation reviewed.'],
            cleanNotes: [{ text: 'Key takeaways and summary notes.', timestamp: 60 }]
          }
        };
      }
      let sub = await getSubject(cls.subjectId);
      if (!sub && subjects.length > 0) {
        sub = subjects[0];
      }
      setCurrentSubject(sub || { id: 'default', name: 'General Subject', color: '#7C3AED', emoji: '📚' });
      setCurrentClass(cls);
    }
  }, [loadSubjects, subjects, user]);

  const refreshSubjects = useCallback(async () => {
    await loadSubjects();
  }, [loadSubjects]);

  const refreshClass = useCallback(async (classId) => {
    const cls = await getClass(classId);
    setCurrentClass(cls);
  }, []);

  // Faculty Start Class Lecture (Live Recording & AI Summary)
  const handleFacultyStartLecture = async (clsInfo) => {
    let targetSub = subjects.find(s => s.name.toLowerCase().includes(clsInfo.name.toLowerCase()));
    if (!targetSub) {
      targetSub = {
        id: generateId(),
        userId: user?.id || 'faculty-alex-johnson',
        name: clsInfo.name,
        emoji: '📚',
        topicPreset: 'studio',
        gradient: 'var(--gradient-purple)',
        color: '#7C3AED',
        createdAt: new Date().toISOString(),
      };
      await saveSubject(targetSub);
      await loadSubjects();
    }

    const newClass = {
      id: generateId(),
      subjectId: targetSub.id,
      title: `${clsInfo.name} - Lecture Session`,
      date: new Date().toISOString(),
      transcript: '',
      notes: [],
      status: 'recording',
      duration: 0,
    };
    await saveClass(newClass);
    setCurrentSubject(targetSub);
    setCurrentClass(newClass);
    navigate(`session:${newClass.id}`);
  };

  // Quick Start Recording
  const handleQuickStartRecording = async () => {
    let targetSubject = currentSubject;
    let availableSubs = subjects;
    if (availableSubs.length === 0) {
      const defaultSub = {
        id: generateId(),
        userId: user?.id || 'anonymous',
        name: 'General Notes',
        emoji: '🎙️',
        topicPreset: 'studio',
        gradient: 'var(--gradient-blue)',
        color: '#1a73e8',
        createdAt: new Date().toISOString(),
      };
      await saveSubject(defaultSub);
      targetSubject = defaultSub;
      await loadSubjects();
    } else if (!targetSubject) {
      targetSubject = availableSubs[0];
    }

    const newClass = {
      id: generateId(),
      subjectId: targetSubject.id,
      title: `Quick Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      date: new Date().toISOString(),
      transcript: '',
      notes: [],
      status: 'recording',
      duration: 0,
    };
    await saveClass(newClass);
    setCurrentSubject(targetSubject);
    setCurrentClass(newClass);
    navigate(`session:${newClass.id}`);
  };

  const renderView = () => {
    // 1. Dashboard View: Route according to role
    if (view === 'dashboard') {
      if (user?.role === 'faculty') {
        return (
          <FacultyPanel
            user={user}
            onLogout={logout}
            onStartLecture={handleFacultyStartLecture}
            onNavigate={navigate}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        );
      }
      return (
        <StudentPanel
          user={user}
          onLogout={logout}
          onNavigate={navigate}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      );
    }

    // 2. Live Session (Faculty & Student Lecture Recording)
    if (view.startsWith('session:')) {
      if (!currentClass) {
        return (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080A12', color: '#CBD5E1' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 38, height: 38, border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontWeight: 600, fontSize: '15px', color: '#FFFFFF' }}>Initializing Live Lecture Studio...</p>
              <p style={{ fontSize: '13px', color: '#64748B' }}>Connecting speech engine and AI assistant</p>
            </div>
          </div>
        );
      }
      return (
        <LiveSession
          classData={currentClass}
          subject={currentSubject || { id: 'default', name: 'Class Lecture', color: '#7C3AED' }}
          onNavigate={navigate}
          onRefreshClass={refreshClass}
        />
      );
    }

    // 3. Notes & AI Summary Viewer
    if (view.startsWith('notes:')) {
      if (!currentClass) {
        return (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080A12', color: '#CBD5E1' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 38, height: 38, border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontWeight: 600, fontSize: '15px', color: '#FFFFFF' }}>Loading Lecture Notes & AI Summary...</p>
              <p style={{ fontSize: '13px', color: '#64748B' }}>Synthesizing key takeaways and flashcards</p>
            </div>
          </div>
        );
      }
      return (
        <NoteViewer
          classData={currentClass}
          subject={currentSubject || { id: 'default', name: 'Lecture Notes', color: '#7C3AED' }}
          onNavigate={navigate}
        />
      );
    }

    // 4. Note Editor
    if (view.startsWith('edit:') && currentClass) {
      return (
        <NoteEditor
          classData={currentClass}
          subject={currentSubject}
          onNavigate={navigate}
          onRefreshClass={refreshClass}
        />
      );
    }

    // 5. Subject View
    if (view.startsWith('subject:') && currentSubject) {
      return (
        <SubjectView
          subject={currentSubject}
          user={user}
          onNavigate={navigate}
          onRefresh={refreshSubjects}
        />
      );
    }

    // 6. Secondary Pages (Wrapped with Navigation Back Bar)
    const renderSubPage = () => {
      if (view === 'calendar') {
        return <Calendar subjects={subjects} onNavigate={navigate} />;
      }
      if (view === 'resources') {
        return <ResourcesPage onNavigate={navigate} />;
      }
      if (view === 'ai-assistant') {
        return <AIAssistantPage onNavigate={navigate} />;
      }
      if (view === 'progress') {
        return <ProgressPage onNavigate={navigate} />;
      }
      if (view === 'assignments') {
        return <AssignmentsPage user={user} onNavigate={navigate} />;
      }
      if (view === 'announcements') {
        return <AnnouncementsPage onNavigate={navigate} />;
      }
      if (view === 'quizzes' || view === 'flashcards') {
        return (
          <FlashcardViewerPage
            currentClass={currentClass || { id: 'sample', title: 'Data Structures Quiz' }}
            initialMode={view === 'quizzes' ? 'quiz' : 'flashcards'}
            onNavigate={navigate}
          />
        );
      }
      if (view === 'notes' || view === 'lectures' || view === 'classes') {
        const isDemo =
          user?.id === 'student-arjun-sharma' ||
          user?.id === 'faculty-alex-johnson' ||
          user?.email?.toLowerCase().includes('arjun.sharma@university.edu') ||
          user?.email?.toLowerCase().includes('alex.johnson@university.edu');
        const targetSub = currentSubject || subjects[0] || (isDemo ? { id: 'sub-dsa', name: 'Data Structures', emoji: '📚', color: '#7C3AED' } : null);
        if (!targetSub) {
          return (
            <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <BookOpen size={32} color="#7C3AED" />
              </div>
              <h2 style={{ fontSize: '20px', color: '#FFFFFF', marginBottom: 8 }}>No Classes Enrolled</h2>
              <p style={{ fontSize: '14px', color: '#64748B', maxWidth: 420, marginBottom: 20 }}>
                {user?.role === 'faculty' ? 'Create your first subject to start recording lectures.' : 'You have not enrolled in any classes yet.'}
              </p>
            </div>
          );
        }
        return (
          <SubjectView
            subject={targetSub}
            user={user}
            onNavigate={navigate}
            onRefresh={refreshSubjects}
          />
        );
      }
      return null;
    };

    const subPageContent = renderSubPage();
    if (subPageContent) {
      return (
        <div className="subpage-wrapper">
          <div className="subpage-top-bar">
            <button
              className="subpage-back-btn"
              onClick={() => navigate('dashboard')}
            >
              <ArrowLeft size={16} />
              <span>Back to {user?.role === 'faculty' ? 'Faculty Portal' : 'Student Panel'}</span>
            </button>
            <span className="subpage-user-pill">
              Logged in as: <strong>{user?.name}</strong> ({user?.role === 'faculty' ? 'Faculty' : 'Student'})
            </span>
          </div>
          <div className="subpage-inner">
            {subPageContent}
          </div>
        </div>
      );
    }

    // Default fallback
    if (user?.role === 'faculty') {
      return (
        <FacultyPanel
          user={user}
          subjects={subjects}
          onLogout={logout}
          onStartLecture={handleFacultyStartLecture}
          onNavigate={navigate}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      );
    }
    return (
      <StudentPanel
        user={user}
        subjects={subjects}
        onLogout={logout}
        onNavigate={navigate}
        onOpenSettings={() => setShowSettingsModal(true)}
      />
    );
  };

  // Not logged in -> Show Authentication Page
  if (!user) {
    return <AuthPage mode="login" onAuthSuccess={(u) => setUser(u)} />;
  }

  // Logged in:
  return (
    <div className="lecture-app-container">
      {renderView()}

      {/* Modals */}
      {showCreateModal && (
        <CreateSubjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            refreshSubjects();
          }}
        />
      )}

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
}

export default function SafeApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
