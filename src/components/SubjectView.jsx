import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Play, Trash2, Calendar, Clock, FileText, Mic } from 'lucide-react';
import { getClassesBySubject, saveClass, deleteSubject, deleteClass } from '../db';
import { generateId, formatDate, formatDuration } from '../utils/helpers';
import { getTopicPreset } from '../utils/topicThemes';
import './SubjectView.css';

function SubjectView({ subject, onNavigate, onRefresh }) {
  const safeSubject = subject || {
    id: 'sub-dsa',
    name: 'Data Structures',
    emoji: '📚',
    topicPreset: 'studio',
    color: '#7C3AED'
  };

  const [classes, setClasses] = useState([]);

  const loadClasses = async () => {
    try {
      const cls = await getClassesBySubject(safeSubject.id);
      setClasses(cls || []);
    } catch (e) {
      console.warn('Error loading classes for subject:', e);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [safeSubject.id]);

  const handleNewClass = async () => {
    const classNumber = classes.length + 1;
    const newClass = {
      id: generateId(),
      subjectId: safeSubject.id,
      title: `${safeSubject.name} - Class ${classNumber}`,
      date: new Date().toISOString(),
      transcript: '',
      notes: [],
      status: 'recording',
      duration: 0,
    };
    await saveClass(newClass);
    onNavigate(`session:${newClass.id}`);
  };

  const handleContinueClass = (classId) => {
    onNavigate(`session:${classId}`);
  };

  const DEMO_CLASSES = [
    {
      id: 'cls-dbms-norm',
      subjectId: safeSubject.id,
      title: 'Database Normalization (1NF to 3NF)',
      date: new Date().toISOString(),
      duration: 2556,
      status: 'completed'
    },
    {
      id: 'cls-dsa-trees',
      subjectId: safeSubject.id,
      title: 'Stacks and Queues',
      date: new Date(Date.now() - 86400000).toISOString(),
      duration: 1840,
      status: 'completed'
    },
    {
      id: 'cls-os-sync',
      subjectId: safeSubject.id,
      title: 'Process Synchronization',
      date: new Date(Date.now() - 172800000).toISOString(),
      duration: 2100,
      status: 'completed'
    }
  ];

  const handleViewNotes = async (classId) => {
    onNavigate(`notes:${classId}`);
  };

  const handleDeleteClass = async (e, classId) => {
    e.stopPropagation();
    if (confirm('Delete this class and all its notes?')) {
      await deleteClass(classId);
      loadClasses();
    }
  };

  const handleDeleteSubject = async () => {
    if (confirm(`Delete "${safeSubject.name}" and all its classes? This cannot be undone.`)) {
      await deleteSubject(safeSubject.id);
      if (onRefresh) onRefresh();
      onNavigate('dashboard');
    }
  };

  const lastPausedClass = classes.find((c) => c.status === 'paused' || c.status === 'recording');
  const topicTheme = getTopicPreset(safeSubject.topicPreset || safeSubject.name);
  const displayClasses = classes.length > 0 ? classes : DEMO_CLASSES;

  return (
    <div className="subject-view-container">
      <nav className="subject-nav">
        <button className="btn-back" onClick={() => onNavigate('dashboard')} aria-label="Back to Dashboard">
          <ArrowLeft size={20} />
        </button>
        <span className="nav-title">{safeSubject.name}</span>
      </nav>

      <header 
        className="subject-header" 
        style={{ backgroundColor: topicTheme.accentColor || 'var(--google-blue)' }}
      >
        <div className="subject-header-content">
          <div className="subject-header-title-wrapper">
            <span className="subject-header-emoji">{safeSubject.emoji}</span>
            <h1 className="subject-header-title">{safeSubject.name}</h1>
          </div>
          <span className="subject-header-badge">
            {displayClasses.length} {displayClasses.length === 1 ? 'Class' : 'Classes'}
          </span>
        </div>
      </header>

      <main className="subject-main">
        <div className="subject-actions">
          <button className="btn-record-new" onClick={handleNewClass}>
            <Plus size={20} />
            Record New Lecture
          </button>
          {lastPausedClass && (
            <button className="btn-continue" onClick={() => handleContinueClass(lastPausedClass.id)}>
              <Play size={20} />
              Continue {lastPausedClass.title}
            </button>
          )}
        </div>

        {displayClasses.length === 0 ? (
          <div className="subject-empty-state">
            <div className="empty-icon">🎙️</div>
            <h3>No classes recorded</h3>
            <p>Start your first class to begin recording and creating smart notes automatically.</p>
          </div>
        ) : (
          <div className="class-list-container">
            {displayClasses.map((cls) => (
              <div
                key={cls.id}
                role="button"
                tabIndex={0}
                className="class-card"
                onClick={() => cls.status === 'completed' ? handleViewNotes(cls.id) : handleContinueClass(cls.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    cls.status === 'completed' ? handleViewNotes(cls.id) : handleContinueClass(cls.id);
                  }
                }}
              >
                <div className="class-card-icon" style={{ color: topicTheme.accentColor, backgroundColor: `${topicTheme.accentColor}15` }}>
                  {cls.status === 'recording' || cls.status === 'paused' ? <Mic size={24} /> : <FileText size={24} />}
                </div>
                
                <div className="class-card-content">
                  <h3 className="class-card-title">{cls.title}</h3>
                  <div className="class-card-meta">
                    <span className="meta-item"><Calendar size={14} /> {formatDate(cls.date)}</span>
                    {cls.duration > 0 && (
                      <span className="meta-chip"><Clock size={12} /> {formatDuration(cls.duration)}</span>
                    )}
                    {cls.status !== 'completed' && (
                      <span className={`status-chip status-${cls.status}`}>{cls.status}</span>
                    )}
                  </div>
                </div>

                <div className="class-card-actions">
                  <button 
                    className="btn-icon-danger"
                    onClick={(e) => handleDeleteClass(e, cls.id)}
                    title="Delete class"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="danger-zone">
          <button className="btn-delete-subject" onClick={handleDeleteSubject}>
            <Trash2 size={18} />
            Delete Subject
          </button>
        </div>
      </main>
    </div>
  );
}

export default SubjectView;
