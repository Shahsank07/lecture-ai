import { useState } from 'react';
import {
  X, Users, Check, AlertCircle, Clock, CheckCircle2,
  Calendar, Search, Download, ArrowRight, Sparkles
} from 'lucide-react';
import { saveAttendanceRecord } from '../../db';
import './FacultyPanel.css';

const INITIAL_ROSTER = [
  { id: '21CS001', name: 'Arjun Sharma', status: 'present' },
  { id: '21CS002', name: 'Priya Patel', status: 'present' },
  { id: '21CS003', name: 'Rohan Verma', status: 'present' },
  { id: '21CS004', name: 'Sneha Nair', status: 'present' },
  { id: '21CS005', name: 'Aditya Kumar', status: 'late' },
  { id: '21CS006', name: 'Ananya Reddy', status: 'present' },
  { id: '21CS007', name: 'Devansh Joshi', status: 'absent' },
  { id: '21CS008', name: 'Isha Gupta', status: 'present' },
  { id: '21CS009', name: 'Karan Mehra', status: 'present' },
  { id: '21CS010', name: 'Meera Pillai', status: 'present' },
  { id: '21CS011', name: 'Nikhil Saxena', status: 'present' },
  { id: '21CS012', name: 'Pooja Iyer', status: 'present' },
  { id: '21CS013', name: 'Rahul Choudhury', status: 'present' },
  { id: '21CS014', name: 'Riya Sen', status: 'present' },
  { id: '21CS015', name: 'Siddharth Rao', status: 'absent' },
  { id: '21CS016', name: 'Tanvi Deshmukh', status: 'present' },
  { id: '21CS017', name: 'Varun Bhatia', status: 'present' },
  { id: '21CS018', name: 'Zoya Khan', status: 'present' },
  { id: '21CS019', name: 'Abhinav Ghosh', status: 'present' },
  { id: '21CS020', name: 'Bhavna Kulkarni', status: 'present' },
  { id: '21CS021', name: 'Chirag Sethi', status: 'present' },
  { id: '21CS022', name: 'Divya Chauhan', status: 'present' },
  { id: '21CS023', name: 'Eashan Kapoor', status: 'present' },
  { id: '21CS024', name: 'Farhan Zaidi', status: 'present' },
  { id: '21CS025', name: 'Gayatri Bhatt', status: 'present' },
  { id: '21CS026', name: 'Harshvardhan Lal', status: 'present' },
  { id: '21CS027', name: 'Ishaan Malhotra', status: 'present' },
  { id: '21CS028', name: 'Jhanvi Trivedi', status: 'present' },
  { id: '21CS029', name: 'Kabir Singhania', status: 'present' },
  { id: '21CS030', name: 'Lavanya Soni', status: 'present' },
  { id: '21CS031', name: 'Manish Pandey', status: 'present' },
  { id: '21CS032', name: 'Neha Vashisht', status: 'present' },
  { id: '21CS033', name: 'Omkar Gokhale', status: 'present' },
  { id: '21CS034', name: 'Prachi Agarwal', status: 'present' },
  { id: '21CS035', name: 'Qasim Mansoor', status: 'present' },
  { id: '21CS036', name: 'Ritika Roy', status: 'present' },
  { id: '21CS037', name: 'Sameer Dalvi', status: 'present' },
  { id: '21CS038', name: 'Trisha Banerjee', status: 'present' },
  { id: '21CS039', name: 'Utsav Mishra', status: 'present' },
  { id: '21CS040', name: 'Vidhi Chauhan', status: 'present' },
  { id: '21CS041', name: 'Yashvardhan Jain', status: 'present' },
  { id: '21CS042', name: 'Zara Merchant', status: 'present' }
];

export default function MarkAttendanceModal({ isOpen, onClose, defaultClass = 'Data Structures' }) {
  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [date, setDate] = useState('2025-05-20');
  const [slot, setSlot] = useState('10:00 AM - 11:00 AM (Room 204)');
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = (studentId, status) => {
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const handleMarkAll = (status) => {
    setRoster(prev => prev.map(s => ({ ...s, status })));
  };

  const filteredRoster = roster.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = roster.filter(s => s.status === 'present').length;
  const absentCount = roster.filter(s => s.status === 'absent').length;
  const lateCount = roster.filter(s => s.status === 'late').length;
  const attendancePercent = ((presentCount / roster.length) * 100).toFixed(1);

  const handleSave = async () => {
    try {
      await saveAttendanceRecord({
        classGroup: selectedClass,
        date,
        slot,
        totalEnrolled: roster.length,
        presentCount,
        absentCount,
        lateCount,
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
      <div className="faculty-modal-content large" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="faculty-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-title-icon emerald">
              <Users size={20} />
            </div>
            <div>
              <h3>Record Class Attendance</h3>
              <p>Verify presence, absentees and maintain academic compliance</p>
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
            <p>{presentCount} Present, {absentCount} Absent, {lateCount} Late ({attendancePercent}% Attendance Rate).</p>
          </div>
        ) : (
          <div className="attendance-modal-body">
            {/* Top Config Row */}
            <div className="attendance-meta-bar">
              <div className="meta-field">
                <span className="meta-label">Class:</span>
                <strong>{selectedClass}</strong>
              </div>
              <div className="meta-field">
                <Calendar size={14} />
                <span>20 May 2025 (Tuesday)</span>
              </div>
              <div className="meta-field">
                <Clock size={14} />
                <span>{slot}</span>
              </div>
            </div>

            {/* Attendance Analytics Summary */}
            <div className="attendance-stats-strip">
              <div className="att-stat-item">
                <span className="stat-num">{roster.length}</span>
                <span className="stat-lbl">Total Enrolled</span>
              </div>
              <div className="att-stat-item green-highlight">
                <span className="stat-num">{presentCount}</span>
                <span className="stat-lbl">Present</span>
              </div>
              <div className="att-stat-item red-highlight">
                <span className="stat-num">{absentCount}</span>
                <span className="stat-lbl">Absent</span>
              </div>
              <div className="att-stat-item yellow-highlight">
                <span className="stat-num">{lateCount}</span>
                <span className="stat-lbl">Late</span>
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
              {filteredRoster.map((student, idx) => (
                <div key={student.id} className={`roster-row status-${student.status}`}>
                  <span className="roster-idx">{idx + 1}</span>
                  <div className="roster-avatar-circle">
                    {student.name.charAt(0)}
                  </div>
                  <div className="roster-student-info">
                    <strong>{student.name}</strong>
                    <span className="roster-roll">{student.id}</span>
                  </div>

                  <div className="roster-status-toggles">
                    <button
                      type="button"
                      className={`status-btn p-btn ${student.status === 'present' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(student.id, 'present')}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      className={`status-btn l-btn ${student.status === 'late' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(student.id, 'late')}
                    >
                      Late
                    </button>
                    <button
                      type="button"
                      className={`status-btn a-btn ${student.status === 'absent' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(student.id, 'absent')}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
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
