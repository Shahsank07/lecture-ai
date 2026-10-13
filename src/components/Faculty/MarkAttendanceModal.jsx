import { useState, useEffect, useMemo } from 'react';
import {
  X, Users, Check, AlertCircle, Clock, CheckCircle2,
  Calendar, Search, Download, ArrowRight, Sparkles, UserPlus,
  Trash2, Plus, FileSpreadsheet, ChevronDown, CheckSquare, Layers
} from 'lucide-react';
import {
  saveAttendanceRecord,
  getClassRoster,
  enrollStudentsInClass,
  removeStudentFromClass,
  getClassRosterKey
} from '../../db';
import './FacultyPanel.css';

const DEPARTMENTS = [
  'CSE', 'ISE', 'ECE', 'EEE', 'Mechanical', 'AI & DS', 'Civil'
];

const SEMESTERS = [
  '1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'
];

const SECTIONS = ['A', 'B', 'C', 'D'];

export default function MarkAttendanceModal({
  isOpen,
  onClose,
  defaultClass = 'Data Structures',
  defaultDept = 'CSE',
  defaultSem = '3rd Sem',
  defaultSec = 'A'
}) {
  // Parsing defaultClass or defaults
  const parsedDept = defaultDept || 'CSE';
  const parsedSem = defaultSem || '3rd Sem';
  const parsedSec = defaultSec || 'A';

  const [selectedDept, setSelectedDept] = useState(parsedDept);
  const [selectedSem, setSelectedSem] = useState(parsedSem);
  const [selectedSec, setSelectedSec] = useState(parsedSec);
  const [subjectTitle, setSubjectTitle] = useState(defaultClass);

  const [date, setDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [slot, setSlot] = useState('10:00 AM - 11:00 AM (Room 204)');
  const [roster, setRoster] = useState([]);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quick Enroll Drawer / Modal tab
  const [showEnrollPanel, setShowEnrollPanel] = useState(false);
  const [enrollMode, setEnrollMode] = useState('bulk'); // 'bulk' | 'range' | 'single'

  // Form states for enroll
  const [bulkText, setBulkText] = useState('');
  const [rangePrefix, setRangePrefix] = useState('21CS');
  const [rangeStart, setRangeStart] = useState('001');
  const [rangeEnd, setRangeEnd] = useState('040');
  const [singleId, setSingleId] = useState('');
  const [singleName, setSingleName] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState(null);

  // Compute active Class Roster Key e.g. "CSE_7th Sem_C"
  const currentClassKey = useMemo(() => {
    return getClassRosterKey(selectedDept, selectedSem, selectedSec);
  }, [selectedDept, selectedSem, selectedSec]);

  // Load roster whenever department, semester, or section changes
  const loadRoster = async () => {
    setLoading(true);
    try {
      const students = await getClassRoster(currentClassKey);
      // Initialize each student with 'present' status if not already set
      setRoster(students.map(s => ({
        ...s,
        status: s.status || 'present'
      })));
    } catch (err) {
      console.warn('Failed to load roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRoster();
    }
  }, [isOpen, currentClassKey]);

  if (!isOpen) return null;

  // Toggle present / absent (Late button removed per user request)
  const handleStatusChange = (studentId, status) => {
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const handleMarkAll = (status) => {
    setRoster(prev => prev.map(s => ({ ...s, status })));
  };

  // Quick enroll submission
  const handlePerformEnroll = async (e) => {
    e.preventDefault();
    let toEnroll = [];

    if (enrollMode === 'bulk') {
      if (!bulkText.trim()) return;
      const lines = bulkText.split('\n');
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (trimmed.includes(',')) {
          const [id, ...rest] = trimmed.split(',');
          toEnroll.push({
            id: id.trim().toUpperCase(),
            name: rest.join(',').trim() || `Student ${index + 1}`
          });
        } else if (trimmed.includes('-')) {
          const [id, ...rest] = trimmed.split('-');
          toEnroll.push({
            id: id.trim().toUpperCase(),
            name: rest.join('-').trim() || `Student ${index + 1}`
          });
        } else {
          // Single roll number or name
          toEnroll.push({
            id: trimmed.toUpperCase(),
            name: `Student ${trimmed.toUpperCase()}`
          });
        }
      });
    } else if (enrollMode === 'range') {
      const startNum = parseInt(rangeStart, 10);
      const endNum = parseInt(rangeEnd, 10);
      if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) return;
      const padLen = rangeStart.length;
      for (let i = startNum; i <= endNum; i++) {
        const numStr = String(i).padStart(padLen, '0');
        const roll = `${rangePrefix.trim().toUpperCase()}${numStr}`;
        toEnroll.push({
          id: roll,
          name: `Student (${roll})`
        });
      }
    } else if (enrollMode === 'single') {
      if (!singleId.trim() || !singleName.trim()) return;
      toEnroll.push({
        id: singleId.trim().toUpperCase(),
        name: singleName.trim()
      });
    }

    if (toEnroll.length === 0) return;

    try {
      await enrollStudentsInClass(currentClassKey, toEnroll);
      setEnrollSuccess(`Successfully enrolled ${toEnroll.length} students into ${selectedDept} ${selectedSem} (Section ${selectedSec})!`);
      setBulkText('');
      setSingleId('');
      setSingleName('');
      await loadRoster();
      setTimeout(() => setEnrollSuccess(null), 3000);
    } catch (err) {
      console.warn('Enrollment error:', err);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!confirm(`Remove student ${studentId} from ${selectedDept} ${selectedSem} Sec-${selectedSec}?`)) return;
    try {
      await removeStudentFromClass(currentClassKey, studentId);
      await loadRoster();
    } catch (err) {
      console.warn('Remove error:', err);
    }
  };

  const filteredRoster = roster.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.id || '').toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = roster.filter(s => s.status === 'present').length;
  const absentCount = roster.filter(s => s.status === 'absent').length;
  const attendancePercent = roster.length > 0
    ? ((presentCount / roster.length) * 100).toFixed(1)
    : '0.0';

  const handleSave = async () => {
    try {
      await saveAttendanceRecord({
        classGroup: `${subjectTitle} (${selectedDept} ${selectedSem} - Sec ${selectedSec})`,
        department: selectedDept,
        semester: selectedSem,
        section: selectedSec,
        date,
        slot,
        totalEnrolled: roster.length,
        presentCount,
        absentCount,
        attendancePercent,
        roster
      });
    } catch (e) {
      console.warn('Failed to save attendance record:', e);
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="faculty-modal-overlay" onClick={onClose}>
      <div className="faculty-modal-content large" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        {/* Header */}
        <div className="faculty-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-title-icon emerald">
              <Users size={20} />
            </div>
            <div>
              <h3>Class Attendance & Student Roster</h3>
              <p>Enroll & verify attendance strictly for enrolled students per department, semester & section</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {saved ? (
          <div className="modal-success-state">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} />
            </div>
            <h4>Attendance Recorded!</h4>
            <p>
              {selectedDept} {selectedSem} (Sec-{selectedSec}): {presentCount} Present, {absentCount} Absent ({attendancePercent}% Attendance Rate).
            </p>
          </div>
        ) : (
          <div className="attendance-modal-body">
            {/* Top Selector: Department, Semester, Section Filter */}
            <div
              style={{
                background: '#0D111E',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr auto',
                gap: '12px',
                alignItems: 'end'
              }}
            >
              <div>
                <label className="modal-field-label" style={{ marginBottom: '4px' }}>Course / Subject</label>
                <input
                  type="text"
                  value={subjectTitle}
                  onChange={e => setSubjectTitle(e.target.value)}
                  className="modal-input"
                  style={{ width: '100%', padding: '8px 10px', background: '#141A2D', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label className="modal-field-label" style={{ marginBottom: '4px' }}>Department</label>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="modal-select"
                  style={{ width: '100%', padding: '8px 10px', background: '#141A2D', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }}
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="modal-field-label" style={{ marginBottom: '4px' }}>Semester</label>
                <select
                  value={selectedSem}
                  onChange={e => setSelectedSem(e.target.value)}
                  className="modal-select"
                  style={{ width: '100%', padding: '8px 10px', background: '#141A2D', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }}
                >
                  {SEMESTERS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="modal-field-label" style={{ marginBottom: '4px' }}>Section</label>
                <select
                  value={selectedSec}
                  onChange={e => setSelectedSec(e.target.value)}
                  className="modal-select"
                  style={{ width: '100%', padding: '8px 10px', background: '#141A2D', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }}
                >
                  {SECTIONS.map(sec => (
                    <option key={sec} value={sec}>Sec {sec}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="modal-primary-btn emerald-btn"
                onClick={() => setShowEnrollPanel(prev => !prev)}
                style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', height: '36px' }}
                title="Enroll students into this class"
              >
                <UserPlus size={15} />
                <span>{showEnrollPanel ? 'Hide Enroll' : 'Enroll Students'}</span>
              </button>
            </div>

            {/* Quick Enrollment Drawer Panel */}
            {showEnrollPanel && (
              <div
                style={{
                  background: '#13192B',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} style={{ color: '#34D399' }} />
                    <strong style={{ color: '#FFFFFF', fontSize: '13.5px' }}>
                      Easy Student Enrollment for {selectedDept} — {selectedSem} (Section {selectedSec})
                    </strong>
                  </div>

                  {/* Mode tabs */}
                  <div style={{ display: 'flex', gap: '4px', background: '#0E1322', padding: '3px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEnrollMode('bulk')}
                      style={{
                        background: enrollMode === 'bulk' ? '#10B981' : 'transparent',
                        color: enrollMode === 'bulk' ? '#FFF' : '#94A3B8',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Paste Names/Rolls
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnrollMode('range')}
                      style={{
                        background: enrollMode === 'range' ? '#10B981' : 'transparent',
                        color: enrollMode === 'range' ? '#FFF' : '#94A3B8',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Roll Range (1-40)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnrollMode('single')}
                      style={{
                        background: enrollMode === 'single' ? '#10B981' : 'transparent',
                        color: enrollMode === 'single' ? '#FFF' : '#94A3B8',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Single Student
                    </button>
                  </div>
                </div>

                {enrollSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '10px' }}>
                    {enrollSuccess}
                  </div>
                )}

                <form onSubmit={handlePerformEnroll}>
                  {enrollMode === 'bulk' && (
                    <div>
                      <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '0 0 6px 0' }}>
                        Paste multiple students line-by-line in format: <code>RollNo, Name</code> (e.g. <code>21CS001, Arjun Sharma</code>)
                      </p>
                      <textarea
                        rows="3"
                        placeholder="21CS001, Arjun Sharma&#10;21CS002, Priya Patel&#10;21CS003, Rohan Verma"
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                        className="modal-textarea"
                        style={{ width: '100%', padding: '8px 12px', background: '#0E1322', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </div>
                  )}

                  {enrollMode === 'range' && (
                    <div>
                      <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '0 0 6px 0' }}>
                        Quick-generate student roll numbers instantly without typing individual names:
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#94A3B8' }}>Prefix</label>
                          <input
                            type="text"
                            value={rangePrefix}
                            onChange={e => setRangePrefix(e.target.value)}
                            placeholder="e.g. 21CS"
                            style={{ width: '100%', padding: '6px 10px', background: '#0E1322', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#94A3B8' }}>Start Roll</label>
                          <input
                            type="text"
                            value={rangeStart}
                            onChange={e => setRangeStart(e.target.value)}
                            placeholder="001"
                            style={{ width: '100%', padding: '6px 10px', background: '#0E1322', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#94A3B8' }}>End Roll</label>
                          <input
                            type="text"
                            value={rangeEnd}
                            onChange={e => setRangeEnd(e.target.value)}
                            placeholder="040"
                            style={{ width: '100%', padding: '6px 10px', background: '#0E1322', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {enrollMode === 'single' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Roll No (e.g. 21CS045)"
                        value={singleId}
                        onChange={e => setSingleId(e.target.value)}
                        style={{ padding: '6px 10px', background: '#0E1322', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        placeholder="Student Full Name"
                        value={singleName}
                        onChange={e => setSingleName(e.target.value)}
                        style={{ padding: '6px 10px', background: '#0E1322', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="modal-primary-btn emerald-btn"
                    style={{ marginTop: '10px', padding: '6px 16px', fontSize: '12px', borderRadius: '6px' }}
                  >
                    <Plus size={14} />
                    <span>Confirm & Enroll into Section {selectedSec}</span>
                  </button>
                </form>
              </div>
            )}

            {/* Attendance Analytics Summary */}
            <div className="attendance-stats-strip">
              <div className="att-stat-item">
                <span className="stat-num">{roster.length}</span>
                <span className="stat-lbl">Enrolled in Sec-{selectedSec}</span>
              </div>
              <div className="att-stat-item green-highlight">
                <span className="stat-num">{presentCount}</span>
                <span className="stat-lbl">Present</span>
              </div>
              <div className="att-stat-item red-highlight">
                <span className="stat-num">{absentCount}</span>
                <span className="stat-lbl">Absent</span>
              </div>
              <div className="att-stat-item percent-highlight">
                <span className="stat-num">{attendancePercent}%</span>
                <span className="stat-lbl">Attendance Rate</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="attendance-filter-actions">
              <div className="roster-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Filter student by name or roll number..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="quick-mark-btns">
                <button
                  type="button"
                  className="quick-att-btn mark-all-p"
                  onClick={() => handleMarkAll('present')}
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  className="quick-att-btn mark-all-a"
                  onClick={() => handleMarkAll('absent')}
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Student Roster Table / List */}
            <div className="roster-scroll-table">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                  Loading enrolled students for {selectedDept} {selectedSem} (Sec-{selectedSec})...
                </div>
              ) : roster.length === 0 ? (
                <div style={{ padding: '50px 20px', textAlign: 'center', color: '#94A3B8' }}>
                  <Users size={44} style={{ margin: '0 auto 12px', opacity: 0.3, color: '#10B981' }} />
                  <h4 style={{ color: '#FFFFFF', fontSize: '15px', marginBottom: '6px' }}>
                    No Students Enrolled in {selectedDept} {selectedSem} (Section {selectedSec})
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '380px', margin: '0 auto 16px' }}>
                    This section has no enrolled students yet. Click <strong>"Enroll Students"</strong> above to paste your class list or auto-generate roll numbers.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowEnrollPanel(true)}
                    className="modal-primary-btn emerald-btn"
                    style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
                  >
                    <UserPlus size={14} />
                    <span>Enroll Students Now</span>
                  </button>
                </div>
              ) : (
                filteredRoster.map((student, idx) => (
                  <div key={student.id} className={`roster-row status-${student.status}`}>
                    <span className="roster-idx">{idx + 1}</span>
                    <div className="roster-avatar-circle">
                      {(student.name || 'S').charAt(0)}
                    </div>
                    <div className="roster-student-info">
                      <strong>{student.name}</strong>
                      <span className="roster-roll">{student.id} • Sec {selectedSec}</span>
                    </div>

                    <div className="roster-status-toggles">
                      {/* Only Present and Absent buttons - Late button removed */}
                      <button
                        type="button"
                        className={`status-btn p-btn ${student.status === 'present' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'present')}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        className={`status-btn a-btn ${student.status === 'absent' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'absent')}
                      >
                        Absent
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(student.id)}
                        title="Remove student from this section"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '4px'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Row */}
            <div className="modal-actions-row">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={roster.length === 0}
                className="modal-primary-btn emerald-btn"
                onClick={handleSave}
              >
                <Check size={16} />
                <span>Save Attendance Record</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
