import { useState } from 'react';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle, FileText,
  Upload, ExternalLink, Filter, Search, ArrowRight, Award, BookOpen
} from 'lucide-react';
import './AssignmentsPage.css';

export default function AssignmentsPage({ user, onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'submitted'
  const [searchQuery, setSearchQuery] = useState('');

  const isDemo =
    user?.id === 'student-arjun-sharma' ||
    user?.id === 'faculty-alex-johnson' ||
    user?.email?.toLowerCase().includes('arjun.sharma@university.edu') ||
    user?.email?.toLowerCase().includes('alex.johnson@university.edu');

  const DEMO_ASSIGNMENTS = [
    {
      id: 'asg-1',
      title: 'DSA Assignment 2: AVL Tree Rotations & Balanced Trees',
      course: 'Data Structures',
      code: 'CS-301',
      dueDate: '22 May 2025, 11:59 PM',
      daysLeft: '2 Days Left',
      urgency: 'danger',
      status: 'pending',
      maxScore: 100,
      description: 'Implement insertion and deletion algorithms for AVL trees with automated self-balancing checks. Submit your .cpp source files and analysis report.',
      submissionType: 'Code & PDF Report'
    },
    {
      id: 'asg-2',
      title: 'DBMS Normalization & Relational Schema Design',
      course: 'Database Management Systems',
      code: 'CS-401',
      dueDate: '25 May 2025, 05:00 PM',
      daysLeft: '5 Days Left',
      urgency: 'warning',
      status: 'pending',
      maxScore: 50,
      description: 'Decompose the given unnormalized company dataset into 1NF, 2NF, and 3NF. Provide dependency diagrams and SQL DDL tables.',
      submissionType: 'PDF Document'
    },
    {
      id: 'asg-3',
      title: 'Operating Systems: Concurrency & Semaphores Case Study',
      course: 'Operating Systems',
      code: 'CS-302',
      dueDate: '28 May 2025, 11:59 PM',
      daysLeft: '8 Days Left',
      urgency: 'safe',
      status: 'pending',
      maxScore: 100,
      description: 'Analyze race conditions in multi-threaded banking systems. Implement solution using POSIX mutex locks and semaphores in C.',
      submissionType: 'Zip Archive'
    },
    {
      id: 'asg-4',
      title: 'Computer Networks: Packet Tracing & WireShark Lab',
      course: 'Computer Networks',
      code: 'CS-402',
      dueDate: '02 June 2025, 11:59 PM',
      daysLeft: '13 Days Left',
      urgency: 'safe',
      status: 'pending',
      maxScore: 50,
      description: 'Capture TCP 3-way handshake and HTTP/2 headers using Wireshark. Answer the worksheet questions based on your pcap logs.',
      submissionType: 'Lab Worksheet'
    },
    {
      id: 'asg-5',
      title: 'DSA Quiz 1: Stacks, Queues & Complexity Analysis',
      course: 'Data Structures',
      code: 'CS-301',
      dueDate: 'Completed on 14 May 2025',
      daysLeft: 'Graded',
      urgency: 'completed',
      status: 'submitted',
      maxScore: 50,
      grade: '48 / 50 (96%)',
      description: 'Online timed multiple-choice and short-answer assessment covering algorithmic asymptotic notation and linear data structures.',
      submissionType: 'Online Assessment'
    },
    {
      id: 'asg-6',
      title: 'DBMS ER-Diagram Blueprint for University ERP',
      course: 'Database Management Systems',
      code: 'CS-401',
      dueDate: 'Completed on 10 May 2025',
      daysLeft: 'Graded',
      urgency: 'completed',
      status: 'submitted',
      maxScore: 100,
      grade: '94 / 100 (94%)',
      description: 'Designed full conceptual schema model with multi-valued attributes and recursive relationships.',
      submissionType: 'Diagram & Document'
    }
  ];

  const assignmentsList = isDemo ? DEMO_ASSIGNMENTS : [];

  const filteredAssignments = assignmentsList.filter(asg => {
    const matchesFilter = activeFilter === 'all' || asg.status === activeFilter;
    const matchesSearch = asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asg.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = assignmentsList.filter(a => a.status === 'pending').length;
  const submittedCount = assignmentsList.filter(a => a.status === 'submitted').length;
  const avgPerformance = isDemo && submittedCount > 0 ? '95.0%' : (submittedCount > 0 ? '100%' : '0%');

  return (
    <div className="assignments-page-container">
      {/* Header section */}
      <div className="assignments-header">
        <div>
          <h1 className="assignments-title">Assignments & Deadlines</h1>
          <p className="assignments-subtitle">Track your coursework tasks, submission deadlines, and grading feedback</p>
        </div>
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
            <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.35, color: '#7C3AED' }} />
            <h3 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '8px' }}>No Assignments Found</h3>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '380px', margin: '0 auto' }}>
              {searchQuery ? 'No assignments match your search query.' : "You don't have any assignments or tasks assigned at this moment."}
            </p>
          </div>
        ) : (
          filteredAssignments.map((asg) => (
          <div key={asg.id} className={`assignment-card ${asg.urgency}`}>
            <div className="card-top-row">
              <div className="course-chip">
                <BookOpen size={13} />
                <span>{asg.course} ({asg.code})</span>
              </div>
              <span className={`urgency-badge ${asg.urgency}`}>
                {asg.daysLeft}
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
                <span><strong>Format:</strong> {asg.submissionType}</span>
              </div>
              {asg.grade && (
                <div className="detail-item grade-item">
                  <Award size={14} />
                  <span><strong>Score:</strong> {asg.grade}</span>
                </div>
              )}
            </div>

            <div className="card-footer-actions">
              {asg.status === 'pending' ? (
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
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
