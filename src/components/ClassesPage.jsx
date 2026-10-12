import { useState, useEffect } from 'react';
import {
  BookOpen, Video, FileText, Plus, Search, Calendar,
  Clock, Play, ArrowRight, FolderOpen, Sparkles, CheckCircle2
} from 'lucide-react';
import SubjectCard from './SubjectCard';
import { getAllClasses } from '../db';
import { formatDuration, formatDate } from '../utils/helpers';
import './ClassesPage.css';

export default function ClassesPage({
  subjects = [],
  user,
  viewType = 'classes', // 'classes' | 'lectures' | 'notes'
  onNavigate,
  onCreateClass
}) {
  const [allLectures, setAllLectures] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(viewType);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(viewType);
  }, [viewType]);

  useEffect(() => {
    async function fetchLectures() {
      setLoading(true);
      try {
        const cls = await getAllClasses();
        // Enrich classes with subject information
        const enriched = cls.map((c) => {
          const sub = subjects.find((s) => s.id === c.subjectId);
          return {
            ...c,
            subjectName: sub?.name || 'General Notes',
            subjectEmoji: sub?.emoji || '📚',
            subjectColor: sub?.color || '#7C3AED'
          };
        });
        enriched.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllLectures(enriched);
      } catch (err) {
        console.warn('Error fetching lectures:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLectures();
  }, [subjects]);

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLectures = allLectures.filter((l) =>
    (l.title && l.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.subjectName && l.subjectName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNotes = filteredLectures.filter(
    (l) => (l.notes && l.notes.length > 0) || (l.summary && (l.summary.overview || l.summary.keyTakeaways))
  );

  return (
    <div className="classes-page-container">
      {/* Top Header */}
      <div className="classes-page-header">
        <div className="classes-header-left">
          <h1 className="classes-page-title">
            {activeTab === 'classes' && 'My Classes & Enrolled Courses'}
            {activeTab === 'lectures' && 'Recorded Lectures & Sessions'}
            {activeTab === 'notes' && 'Lecture Notes & AI Summaries'}
          </h1>
          <p className="classes-page-subtitle">
            {activeTab === 'classes' && 'Manage your active subjects, explore lecture archives, and record live sessions'}
            {activeTab === 'lectures' && 'Review your recorded classes with synchronized audio and smart transcripts'}
            {activeTab === 'notes' && 'Synthesized takeaway summaries, key concepts, and highlighted notes'}
          </p>
        </div>

        <div className="classes-header-actions">
          <button className="btn-create-class-primary" onClick={onCreateClass}>
            <Plus size={18} />
            <span>Create New Class</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="classes-page-controls">
        <div className="classes-tab-pills">
          <button
            className={`tab-pill-btn ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            <BookOpen size={16} />
            <span>Classes ({subjects.length})</span>
          </button>
          <button
            className={`tab-pill-btn ${activeTab === 'lectures' ? 'active' : ''}`}
            onClick={() => setActiveTab('lectures')}
          >
            <Video size={16} />
            <span>Lectures ({allLectures.length})</span>
          </button>
          <button
            className={`tab-pill-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <FileText size={16} />
            <span>Notes ({filteredNotes.length})</span>
          </button>
        </div>

        <div className="classes-search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ================= TAB 1: CLASSES ================= */}
      {activeTab === 'classes' && (
        <div className="classes-content-section">
          {filteredSubjects.length === 0 ? (
            <div className="empty-classes-box">
              <div className="empty-icon-circle">
                <BookOpen size={36} color="#7C3AED" />
              </div>
              <h3>{searchQuery ? 'No matching classes found' : 'No Enrolled Classes Yet'}</h3>
              <p>
                {searchQuery
                  ? 'Try searching with different keywords or clear the filter.'
                  : 'Get started by creating your first subject or classroom studio. You can record lectures and generate smart notes automatically.'}
              </p>
              <button className="btn-create-first-class" onClick={onCreateClass}>
                <Plus size={18} />
                <span>Create Your First Class</span>
              </button>
            </div>
          ) : (
            <div className="subjects-cards-grid">
              {filteredSubjects.map((sub) => (
                <SubjectCard
                  key={sub.id}
                  subject={sub}
                  onClick={() => onNavigate(`subject:${sub.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: LECTURES ================= */}
      {activeTab === 'lectures' && (
        <div className="classes-content-section">
          {filteredLectures.length === 0 ? (
            <div className="empty-classes-box">
              <div className="empty-icon-circle blue">
                <Video size={36} color="#38BDF8" />
              </div>
              <h3>{searchQuery ? 'No matching lectures found' : 'No Recorded Lectures Yet'}</h3>
              <p>
                {searchQuery
                  ? 'No lectures match your search query.'
                  : 'Start a live lecture in any of your classes to record audio, capture real-time speech, and generate smart notes.'}
              </p>
              {subjects.length > 0 ? (
                <button
                  className="btn-create-first-class"
                  onClick={() => onNavigate(`subject:${subjects[0].id}`)}
                >
                  <Play size={18} />
                  <span>Open {subjects[0].name} to Record</span>
                </button>
              ) : (
                <button className="btn-create-first-class" onClick={onCreateClass}>
                  <Plus size={18} />
                  <span>Create Class to Start Recording</span>
                </button>
              )}
            </div>
          ) : (
            <div className="lectures-cards-grid">
              {filteredLectures.map((lec) => (
                <div
                  key={lec.id}
                  className="lecture-item-card"
                  onClick={() => onNavigate(lec.status === 'completed' ? `notes:${lec.id}` : `session:${lec.id}`)}
                >
                  <div className="lecture-card-header">
                    <span className="lecture-sub-badge" style={{ backgroundColor: `${lec.subjectColor}20`, color: lec.subjectColor, border: `1px solid ${lec.subjectColor}40` }}>
                      {lec.subjectEmoji} {lec.subjectName}
                    </span>
                    <span className={`status-pill ${lec.status}`}>
                      {lec.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <h3 className="lecture-card-title">{lec.title}</h3>

                  <div className="lecture-meta-row">
                    <span className="meta-item">
                      <Calendar size={13} />
                      {formatDate(lec.date)}
                    </span>
                    <span className="meta-item">
                      <Clock size={13} />
                      {formatDuration(lec.duration || 0)}
                    </span>
                  </div>

                  <div className="lecture-card-footer">
                    <span className="action-link">
                      {lec.status === 'completed' ? 'View Notes & AI Summary' : 'Resume Session'}
                    </span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: NOTES ================= */}
      {activeTab === 'notes' && (
        <div className="classes-content-section">
          {filteredNotes.length === 0 ? (
            <div className="empty-classes-box">
              <div className="empty-icon-circle green">
                <FileText size={36} color="#10B981" />
              </div>
              <h3>{searchQuery ? 'No matching notes found' : 'No Lecture Notes Available'}</h3>
              <p>
                {searchQuery
                  ? 'No notes match your search term.'
                  : 'Notes, AI summaries, and flashcards generated from your lectures will appear here.'}
              </p>
            </div>
          ) : (
            <div className="notes-cards-grid">
              {filteredNotes.map((noteLec) => (
                <div
                  key={noteLec.id}
                  className="note-item-card"
                  onClick={() => onNavigate(`notes:${noteLec.id}`)}
                >
                  <div className="note-card-top">
                    <span className="note-sub-tag">
                      {noteLec.subjectEmoji} {noteLec.subjectName}
                    </span>
                    <span className="note-date">{formatDate(noteLec.date)}</span>
                  </div>

                  <h3 className="note-title">{noteLec.title}</h3>
                  <p className="note-preview-text">
                    {noteLec.summary?.overview ||
                      (noteLec.notes?.[0]?.text) ||
                      'Interactive lecture notes with synchronized transcription and key concepts.'}
                  </p>

                  <div className="note-card-footer">
                    <span className="note-action-tag">
                      <Sparkles size={13} /> Read AI Summary
                    </span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
