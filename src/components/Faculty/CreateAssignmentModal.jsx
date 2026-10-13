import { useState } from 'react';
import {
  X, ClipboardList, Plus, Trash2, CheckCircle2, Calendar,
  Clock, FileText, Check, AlertCircle, BookOpen, Layers
} from 'lucide-react';
import { generateId } from '../../utils/helpers';
import { saveAssignment, addNotification } from '../../db';
import './FacultyPanel.css';

const DEFAULT_CLASSES = [
  'Data Structures (B.Tech CSE - 3rd Sem)',
  'Database Management Systems (B.Tech CSE - 4th Sem)',
  'Operating Systems (B.Tech CSE - 3rd Sem)',
  'Computer Networks (B.Tech CSE - 4th Sem)',
  'Artificial Intelligence (B.Tech CSE - 6th Sem)'
];

export default function CreateAssignmentModal({ isOpen, onClose, onAssignmentCreated, subjects = [] }) {
  const classOptions = subjects.length > 0
    ? subjects.map(s => `${s.name} (${s.code || 'CS-Course'})`)
    : DEFAULT_CLASSES;

  const [selectedClass, setSelectedClass] = useState(classOptions[0] || DEFAULT_CLASSES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [submissionType, setSubmissionType] = useState('PDF Document');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an assignment title.');
      return;
    }
    if (!dueDate) {
      setError('Please specify a due date.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Extract course name from selectedClass e.g. "Data Structures (CS-301)"
    const courseName = selectedClass.split('(')[0].trim();
    const courseCodeMatch = selectedClass.match(/\(([^)]+)\)/);
    const courseCode = courseCodeMatch ? courseCodeMatch[1].trim() : 'CS';

    // Calculate days left display
    const dueTime = new Date(dueDate).getTime();
    const nowTime = Date.now();
    const diffDays = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));
    let daysLeft = 'Due Soon';
    let urgency = 'warning';
    if (diffDays <= 2) {
      daysLeft = diffDays <= 0 ? 'Due Today' : `${diffDays} Day${diffDays > 1 ? 's' : ''} Left`;
      urgency = 'danger';
    } else if (diffDays <= 7) {
      daysLeft = `${diffDays} Days Left`;
      urgency = 'warning';
    } else {
      daysLeft = `${diffDays} Days Left`;
      urgency = 'safe';
    }

    const assignmentData = {
      id: 'asg-' + generateId(),
      title: title.trim(),
      course: courseName,
      code: courseCode,
      classGroup: selectedClass,
      dueDate: new Date(dueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 11:59 PM',
      rawDueDate: dueDate,
      daysLeft,
      urgency,
      status: 'pending',
      maxScore: parseInt(maxScore, 10) || 100,
      description: description.trim() || 'Complete the assignment questions and submit before the deadline.',
      submissionType,
      createdAt: new Date().toISOString()
    };

    try {
      await saveAssignment(assignmentData);
      await addNotification({
        id: 'notif-' + assignmentData.id,
        title: `New Assignment: ${assignmentData.title}`,
        desc: `${assignmentData.course} assignment posted. Due: ${assignmentData.dueDate}`,
        time: 'Just now',
        type: 'feature',
        targetRole: 'all',
        unread: true
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onAssignmentCreated) onAssignmentCreated(assignmentData);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setDueDate('');
      }, 1000);
    } catch (err) {
      setError('Failed to save assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="faculty-modal-overlay" onClick={onClose}>
      <div className="faculty-modal-content large" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="faculty-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-title-icon emerald">
              <ClipboardList size={20} />
            </div>
            <div>
              <h3>Publish Class Assignment</h3>
              <p>Create coursework tasks with deadlines for enrolled students</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="modal-success-state">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} />
            </div>
            <h4>Assignment Published!</h4>
            <p>"{title}" is now visible to enrolled students in their portal.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
              <div>
                <label className="modal-field-label">Target Class / Subject</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="modal-select"
                  style={{ width: '100%', padding: '10px 12px', background: '#13192B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '10px', fontSize: '13px' }}
                >
                  {classOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="modal-field-label">Due Date & Time</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  required
                  className="modal-input"
                  style={{ width: '100%', padding: '10px 12px', background: '#13192B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '10px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label className="modal-field-label">Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Graph Algorithms & Shortest Path Problem Set"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="modal-input"
                style={{ width: '100%', padding: '10px 12px', background: '#13192B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '10px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label className="modal-field-label">Problem Description & Instructions</label>
              <textarea
                rows="4"
                placeholder="Describe problem specifications, required deliverables, evaluation rubrics..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="modal-textarea"
                style={{ width: '100%', padding: '10px 12px', background: '#13192B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '10px', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="modal-field-label">Max Score / Points</label>
                <input
                  type="number"
                  value={maxScore}
                  onChange={e => setMaxScore(e.target.value)}
                  className="modal-input"
                  style={{ width: '100%', padding: '10px 12px', background: '#13192B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label className="modal-field-label">Submission Format</label>
                <select
                  value={submissionType}
                  onChange={e => setSubmissionType(e.target.value)}
                  className="modal-select"
                  style={{ width: '100%', padding: '10px 12px', background: '#13192B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '10px', fontSize: '13px' }}
                >
                  <option value="PDF Document">PDF Document</option>
                  <option value="Code & PDF Report">Code & PDF Report</option>
                  <option value="Zip Archive">Zip Archive (.zip / .tar)</option>
                  <option value="Lab Worksheet">Lab Worksheet</option>
                  <option value="Online Assessment">Online Assessment</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-row" style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="modal-primary-btn emerald-btn"
              >
                <Check size={16} />
                <span>{submitting ? 'Publishing...' : 'Publish to Students'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
