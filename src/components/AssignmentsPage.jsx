import { useState, useEffect } from 'react';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle, FileText,
  Upload, ExternalLink, Filter, Search, ArrowRight, Award, BookOpen, Plus
} from 'lucide-react';
import { getAllAssignments } from '../db';
import CreateAssignmentModal from './Faculty/CreateAssignmentModal';
import './AssignmentsPage.css';

export default function AssignmentsPage({ user, onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'submitted'
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isFaculty = user?.role === 'faculty';

  const loadAssignments = async () => {
    try {
      const data = await getAllAssignments(user);
      setAssignmentsList(data || []);
    } catch (err) {
      console.warn('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const filteredAssignments = assignmentsList.filter(asg => {
    const matchesFilter = activeFilter === 'all' || asg.status === activeFilter;
    const matchesSearch = (asg.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (asg.course || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (asg.classGroup || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = assignmentsList.filter(a => a.status === 'pending').length;
  const submittedCount = assignmentsList.filter(a => a.status === 'submitted').length;
  const avgPerformance = submittedCount > 0 ? '94.5%' : '0%';

  return (
    <div className="assignments-page-container">
      {/* Header section */}
      <div className="assignments-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="assignments-title">Assignments & Coursework</h1>
          <p className="assignments-subtitle">
            {isFaculty
              ? 'Create, publish and manage coursework assignments for your classes'
              : 'Track published assignments, deadlines, and submission feedback for your classes'}
          </p>
        </div>

        {isFaculty && (
          <button
            className="modal-primary-btn emerald-btn"
            onClick={() => setShowCreateModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Stats summary row */}
      <div className="assignments-stats-grid">
        <div className="asg-stat-card">
          <div className="stat-icon purple-stat"><ClipboardList size={22} /></div>
          <div>
            <div className="stat-value">{assignmentsList.length}</div>
            <div className="stat-label">Total Assigned</div>
          </div>
        </div>
        <div className="asg-stat-card">
          <div className="stat-icon orange-stat"><Clock size={22} /></div>
          <div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Deadlines</div>
          </div>
        </div>
        <div className="asg-stat-card">
          <div className="stat-icon green-stat"><CheckCircle2 size={22} /></div>
          <div>
            <div className="stat-value">{submittedCount}</div>
            <div className="stat-label">Submitted & Graded</div>
          </div>
        </div>
        <div className="asg-stat-card">
          <div className="stat-icon blue-stat"><Award size={22} /></div>
          <div>
            <div className="stat-value">{avgPerformance}</div>
            <div className="stat-label">Average Performance</div>
          </div>
        </div>
      </div>

      {/* Controls: search and tabs */}
      <div className="assignments-controls">
        <div className="asg-tabs">
          <button
            className={`asg-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Tasks ({assignmentsList.length})
          </button>
          <button
            className={`asg-tab-btn ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            Pending Deadlines ({pendingCount})
          </button>
          <button
            className={`asg-tab-btn ${activeFilter === 'submitted' ? 'active' : ''}`}
            onClick={() => setActiveFilter('submitted')}
          >
            Completed & Graded ({submittedCount})
          </button>
        </div>

        <div className="asg-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search assignments by name or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Assignments cards list */}
      <div className="assignments-list-grid">
        {filteredAssignments.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94A3B8', gridColumn: '1 / -1' }}>
            <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.35, color: '#10B981' }} />
            <h3 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '8px' }}>No assignments yet</h3>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '400px', margin: '0 auto 20px' }}>
              {isFaculty
                ? 'You have not published any assignments yet. Click below to create and publish an assignment for your students.'
                : 'Your faculty has not published any assignments for your classes yet. Check back soon!'}
            </p>
            {isFaculty && (
              <button
                className="modal-primary-btn emerald-btn"
                onClick={() => setShowCreateModal(true)}
                style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                <span>Create Assignment</span>
              </button>
            )}
          </div>
        ) : (
          filteredAssignments.map((asg) => (
            <div key={asg.id} className={`assignment-card ${asg.urgency || 'warning'}`}>
              <div className="card-top-row">
                <div className="course-chip">
                  <BookOpen size={13} />
                  <span>{asg.course || 'Coursework'} {asg.code ? `(${asg.code})` : ''}</span>
                </div>
                <span className={`urgency-badge ${asg.urgency || 'warning'}`}>
                  {asg.daysLeft || 'Due Soon'}
                </span>
              </div>

              <h3 className="card-title">{asg.title}</h3>
              <p className="card-desc">{asg.description}</p>

              <div className="card-details-row">
                <div className="detail-item">
                  <Clock size={14} />
                  <span><strong>Due:</strong> {asg.dueDate}</span>
                </div>
                <div className="detail-item">
                  <FileText size={14} />
                  <span><strong>Format:</strong> {asg.submissionType || 'PDF Document'}</span>
                </div>
                {asg.maxScore && (
                  <div className="detail-item">
                    <Award size={14} />
                    <span><strong>Max Score:</strong> {asg.maxScore} pts</span>
                  </div>
                )}
                {asg.grade && (
                  <div className="detail-item grade-item">
                    <Award size={14} />
                    <span><strong>Score:</strong> {asg.grade}</span>
                  </div>
                )}
              </div>

              <div className="card-footer-actions">
                {isFaculty ? (
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                      className="btn-submit-solution"
                      style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#C084FC', border: '1px solid rgba(124, 58, 237, 0.3)' }}
                      onClick={() => alert(`Viewing submissions for "${asg.title}".`)}
                    >
                      <CheckCircle2 size={14} />
                      <span>View Submissions</span>
                    </button>
                    <button
                      className="btn-practice-quiz"
                      onClick={() => onNavigate('quizzes')}
                      title="Attach quiz questions"
                    >
                      <span>Quiz Questions</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  asg.status === 'pending' ? (
                    <>
                      <button
                        className="btn-submit-solution"
                        onClick={() => alert(`Submission dialog opened for: ${asg.title}. Select your file to upload.`)}
                      >
                        <Upload size={14} />
                        <span>Submit Work</span>
                      </button>
                      <button
                        className="btn-practice-quiz"
                        onClick={() => onNavigate('quizzes')}
                        title="Practice interactive questions for this topic"
                      >
                        <span>Practice Quiz</span>
                        <ArrowRight size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-view-feedback"
                      onClick={() => alert(`Grade feedback for ${asg.title}: Excellent work! Full marks awarded on implementation correctness.`)}
                    >
                      <CheckCircle2 size={14} />
                      <span>View Instructor Feedback</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAssignmentCreated={() => loadAssignments()}
      />
    </div>
  );
}
